const fs = require('fs');

function cleanHSNR(n) {
  while (n.substring(0, 1) === '0') {
    n = n.substring(1);
  }
  return n;
}

function array2csv(dataArr, head) {
  let csv = head;

  dataArr.forEach((d) => {
    csv += '\n';
    if (Array.isArray(d)) {
      d.forEach((dd, ii) => {
        if (ii > 0) {
          csv += ',';
        }
        csv += dd;
      });
    } else {
      csv += d;
    }
  });

  return csv;
}

let data = [];

fs.readdirSync('./data/address').forEach((filename) => {
  if (filename.substr(0, 1) !== '.') {
    const fileDataJson = fs.readFileSync(`./data/address/${filename}`, 'utf8');
    const { features } = JSON.parse(fileDataJson);
    data = data.concat(features);
  }
});

const light = [],
  streets = [],
  streetKeys = {},
  streetCounts = {};

data.forEach((d) => {
  d.properties.STRNR = parseInt(d.properties.STRNR, 10);
  const strNr = d.properties.STRNR;
  const strName = d.properties.STRNAME;
  const strPlz = parseInt(d.properties.PLZ, 10);

  if (!(strName in streetCounts)) {
    streetCounts[strName] = 1;
  } else if (!(strNr in streetKeys)) {
    streetCounts[strName] += 1;
  }

  if (!(strNr in streetKeys)) {
    streets.push([strName, [strPlz]]);
    streetKeys[strNr] = streets.length - 1;
  } else if (streets[streetKeys[strNr]][1].indexOf(strPlz) === -1) {
    streets[streetKeys[strNr]][1].push(strPlz);
  }

  light.push([
    strName,
    strNr,
    // remove leading zeros
    cleanHSNR(d.properties.HSNR),
    strPlz,
    // Reduce precision of coordinates
    d.geometry.coordinates[0].toFixed(5),
    d.geometry.coordinates[1].toFixed(5),
  ]);
});

fs.writeFileSync('./data/address.csv', array2csv(light, 'strname,hsnr,plz,lat,lon'), 'utf8'); // lat, lon

// Remove streetnames and organize in separate file

/* light.forEach((d,i) => {
  light[i][0] = streetKeys[light[i][0]+light[i][2]]
}) */

streets.forEach((s, i) => {
  if (streetCounts[streets[i][0]] > 1) {
    streets[i][1] = streets[i][1].join('|');
  } else {
    streets[i][1] = '';
  }
});

fs.writeFileSync('./data/streets.csv', array2csv(streets, 'street,plz'), 'utf8');
// fs.writeFileSync('./data/streets.json', JSON.stringify(streets), 'utf8')

light.forEach((d, i) => {
  light[i] = [streetKeys[d[1]], d[2], d[3], d[4], d[5]];
});

// fs.writeFileSync('./data/address.min.csv', array2csv(light, 'strname,hsnr,lon,lat'), 'utf8')
fs.writeFileSync('./data/address.min.csv', array2csv(light, 'street,hsnr,plz,lat,lon'), 'utf8');
// fs.writeFileSync('./data/address.min.json', JSON.stringify(light), 'utf8')
