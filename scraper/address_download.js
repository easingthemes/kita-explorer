const { exec } = require('child_process');
const { resolve } = require('path');

const minx = 369095.687897,
  miny = 5799302.08121,
  maxx = 416868.309276,
  maxy = 5838240.33418;

const steps = 8;
let x = 0,
  y = 0;

function getData() {
  console.log(x, y);
  const cliParams = [
    '-spat',
    (minx + (maxx - minx) / steps * x),
    (miny + (maxy - miny) / steps * y),
    (minx + (maxx - minx) / steps * (x + 1)),
    (miny + (maxy - miny) / steps * (y + 1)),
    '-s_srs EPSG:25833',
    '-t_srs WGS84',
    '-f GeoJSON',
    resolve(`./data/address/address_${x}_${y}.geojson`),
    'WFS:"http://fbinter.stadt-berlin.de/fb/wfs/geometry/senstadt/re_rbsadressen"',
    're_rbsadressen',
  ];

  exec(`ogr2ogr ${cliParams.join(' ')}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stdout, stderr);

    x += 1;
    if (x > steps) {
      x = 0;
      y += 1;
      if (y > steps) {
        console.log('done');
      } else {
        getData();
      }
    } else {
      getData();
    }
  });
}

getData();
