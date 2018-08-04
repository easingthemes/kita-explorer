const fs = require('fs'),
  d3 = require('d3'),
  gmaps = require('@google/maps'),
  data = require('./data/kitas.json'),
  config = require('./config.json');

const googleMapsClient = gmaps.createClient({
  key: config.api_key,
});

// instead of georeference use the berlin address data

const address = d3.csvParse(fs.readFileSync('./data/address.csv', 'utf8'));
const addressFix = d3.csvParse(fs.readFileSync('./data/address_fix.csv', 'utf8'));

// const notFound = { 0: 0, 1: 0, 2: 0 };

function removeZero(num) {
  while (num.substr(0, 1) === '0') {
    num = num.slice(1, num.length);
  }
  return num;
}

const xOffs = [],
  yOffs = [];

function processKita(d, di) {
  const m = d.mapLink.split('='),
    postcode = m[1].split('&')[0],
    street = decodeURIComponent(m[2].split('&')[0]).split('+').join(' '),
    num = removeZero(m[3]);
  let found = false;

  d.geo['e'] = 2;
  d.geo['alat'] = 0;
  d.geo['alon'] = 0;

  let error = Number.MAX_VALUE;

  ([address, addressFix]).forEach((add) => {
    add.forEach((a) => {
      // strname, hsnr, plz,lat,lon
      if (a.strname === street && a.hsnr === num && a.plz === postcode) {
        d.geo.alat = +a.lon;
        d.geo.alon = +a.lat;
        d.geo.e = 0;
        found = true;
      } else if (d.geo.e !== 0 && a.strname === street && a.hsnr === num
          && error > Math.abs(a.plz - postcode)) {
        d.geo.alat = +a.lon;
        d.geo.alon = +a.lat;
        d.geo.e = 1;
        error = Math.abs(a.plz - postcode);
      }
    });
  });

  if (d.geo.e === 2) {
    console.log(2, postcode, street, num, found);
    nextKita(d, di);
  } else if (d.geo.e === 1 && error > 10) {
    googleMapsClient.geocode({
      address: `${street} ${num}, ${postcode}, Berlin, Germany`,
    }, (err, response) => {
      if (err) {
        console.log(1, postcode, street, num, error, err);
      } else {
        if (response.json.status === 'ZERO_RESULTS') {
          console.log(1, postcode, street, num, error, 'ZERO_RESULTS');
        } else {
          const yOff = Math.abs(d.geo.alat - response.json.results[0].geometry.location.lat),
            xOff = Math.abs(d.geo.alon - response.json.results[0].geometry.location.lng);

          xOffs.push(xOff);
          yOffs.push(yOff);

          // if (xOff > 0.001 || yOff > 0.001) {
          console.log(`1,${postcode},${street},${num},${error},${xOff},${yOff}`);
          // }

          d.geo.alat = response.json.results[0].geometry.location.lat;
          d.geo.alon = response.json.results[0].geometry.location.lng;
        }
      }
      nextKita(d, di);
    });
  } else {
    nextKita(d, di);
  }
}

function nextKita(d, di) {
  if (di >= 0) {
    data.data[di] = d;
  }

  di += 1;

  if (di < data.data.length) {
    processKita(data.data[di], di);
  } else {
    console.log('x', d3.extent(xOffs), d3.mean(xOffs), d3.median(xOffs));
    console.log('y', d3.extent(yOffs), d3.mean(yOffs), d3.median(yOffs));
    restOfProcess();
  }
}

nextKita(null, -1);

function timeConversion(t) {
  if (t.indexOf(':') >= 0) {
    const times = t.split(':');
    return parseInt(times[0], 10) * 4 + parseInt(times[1], 10) / 15;
  }
  return 'NaN';
}

function restOfProcess() {
  const dict = {
    educational: [],
    topics: [],
    languages: [],
    type: [],
    parentType: [],
    parent: [],
  };
  const keys = {
    educational: {},
    topics: {},
    languages: {},
    type: {},
    parentType: {},
    parent: {},
  };

  // in a first run we replace common strings by ids and store them in a dictionary instead

  data.data.forEach((d, i, a) => {
    (['educational', 'topics', 'languages', 'type', 'parentType', 'parent']).forEach((t) => {
      if (t === 'educational' || t === 'topics' || t === 'languages') {
        a[i][t].forEach((dd, ii) => {
          dd = dd.trim();

          if (!(dd in keys[t])) {
            dict[t].push(dd);
            keys[t][dd] = dict[t].length - 1;
            a[i][t][ii] = keys[t][dd];
          } else {
            a[i][t][ii] = keys[t][dd];
          }
        });
      } else if (!(d[t] in keys[t])) {
        dict[t].push(d[t]);
        keys[t][d[t]] = dict[t].length - 1;
        a[i][t] = keys[t][d[t]];
      } else {
        a[i][t] = keys[t][d[t]];
      }
    });
  });

  fs.writeFileSync('./data/kitas_test.json', JSON.stringify(data.data), 'utf8');

  let csv = 'id,lat,lon,e,alat,alon,address,district,plz,educational,topics,languages,name,type,parent,parenttype,mo_o,mo_c,tu_o,tu_c,we_o,we_c,th_o,th_c,fr_o,fr_c,all,over,under';

  data.data.forEach((d) => {
    if (d.open[0] === 0) {
      d.open = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ];
    }

    csv += '\n';
    csv += d.id + ',' +
      d.geo.lat + ',' +
      d.geo.lon + ',' +
      d.geo.e + ',' +
      d.geo.alat + ',' +
      d.geo.alon + ',' +
      '"' + d.address + '",' +
      '"' + d.district + '",' +
      d.postcode + ',' +
      ((d.educational.length>0)?('"' + d.educational.join('|') + '"'):'') + ',' +
      ((d.topics.length>0)?('"' + d.topics.join('|') + '"'):'') + ',' +
      ((d.languages.length>0)?('"' + d.languages.join('|') + '"'):'') + ',' +
      '"' + (d.name.split('"').join('').split("\n"))[0] + '",' +
      d.type + ',' +
      d.parent + ',' +
      d.parentType + ',' +
      timeConversion(d.open[0][0]) + ',' +
      timeConversion(d.open[0][1]) + ',' +
      timeConversion(d.open[1][0]) + ',' +
      timeConversion(d.open[1][1]) + ',' +
      timeConversion(d.open[2][0]) + ',' +
      timeConversion(d.open[2][1]) + ',' +
      timeConversion(d.open[3][0]) + ',' +
      timeConversion(d.open[3][1]) + ',' +
      timeConversion(d.open[4][0]) + ',' +
      timeConversion(d.open[4][1]) + ',' +
      d.structure.overall + ',' +
      d.structure.over + ',' +
      d.structure.under
  });

  fs.writeFileSync('./data/kitas.csv', csv, 'utf8');
  fs.writeFileSync('./data/kitas_dict.json', JSON.stringify(dict), 'utf8');
}
