const fs = require('fs'),
  request = require('request'),
  cheerio = require('cheerio'),
  nodeGeocoder = require('node-geocoder'),
  cliProgress = require('cli-progress'),
  old = require('./data/kitas.json'),
  config = require('./config.json');

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic),
  data = { date: Date.now(), data: [] },
  keys = {},
  options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: config.api_key,
    formatter: null,
  },
  geocoder = nodeGeocoder(options);

let ki = 0,
  errorCount = 0,
  $;

function parseKitas() {
  request(`https://www.berlin.de/sen/jugend/familie-und-kinder/kindertagesbetreuung/kitas/verzeichnis/${data.data[ki].link}`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(body);

      data.data[ki].type = $('#lblEinrichtungsart').text().trim();
      data.data[ki].parentType = $('#lblTraegerart').text().trim();
      data.data[ki].mapLink = $('#HLinkStadtplan').attr('href').trim();
      data.data[ki].name = ($('#lblKitaname').text().trim().split('"').join('').split('\n'))[0];
      data.data[ki].zusatz = ($('#lblKitaname').text().trim().split('"').join('').split('\n'))[1];

      data.data[ki].postcode = parseInt((data.data[ki].mapLink.match(/[0-9]*(?=&ADR)/))[0], 10);

      data.data[ki].phone = $('#lblTelefon').text().trim();
      data.data[ki].email = $('#HLinkEMail').attr('href');
      if (data.data[ki].email && data.data[ki].email.length > 6 && data.data[ki].email.indexOf('mailto') >= 0) {
        data.data[ki].email = (data.data[ki].email.split('to:'))[1].trim();
      }
      data.data[ki].webLink = $('#HLinkWeb').attr('href');
      data.data[ki].image = $('#imgKita').attr('src');
      // 'https://www.berlin.de/sen/jugend/familie-und-kinder/kindertagesbetreuung/kitas/verzeichnis/' + ImageURL

      if ($('#lblPaedSchwerpunkte').text().trim().length === 0) {
        data.data[ki].educational = [];
      } else {
        const educational = $('#lblPaedSchwerpunkte').text().trim().split(',');
        data.data[ki].educational = educational.map(d => d.trim());
      }

      if ($('#lblThemSchwerpunkte').text().trim().length === 0) {
        data.data[ki].topics = [];
      } else {
        const topics = $('#lblThemSchwerpunkte').text().trim().split(',');
        data.data[ki].topics = topics.map(d => d.trim());
      }

      if ($('#lblMehrsprachigkeit').text().trim().length === 0) {
        data.data[ki].languages = [];
      } else {
        const languages = $('#lblMehrsprachigkeit').text().trim().split(',');
        data.data[ki].languages = languages.map(d => d.trim());
      }

      data.data[ki].open = [
        ($('#lblOeffnungMontag').text().trim().length > 4) ? ($('#lblOeffnungMontag').text().replace(/<b>(.|\n)*<\/b>/gm, '').trim().split(' '))[1].split('-') : 0,
        ($('#lblOeffnungDienstag').text().trim().length > 4) ? ($('#lblOeffnungDienstag').text().replace(/<b>(.|\n)*<\/b>/gm, '').trim().split(' '))[1].split('-') : 0,
        ($('#lblOeffnungMittwoch').text().trim().length > 4) ? ($('#lblOeffnungMittwoch').text().replace(/<b>(.|\n)*<\/b>/gm, '').trim().split(' '))[1].split('-') : 0,
        ($('#lblOeffnungDonnerstag').text().trim().length > 4) ? ($('#lblOeffnungDonnerstag').text().replace(/<b>(.|\n)*<\/b>/gm, '').trim().split(' '))[1].split('-') : 0,
        ($('#lblOeffnungFreitag').text().trim().length > 4) ? ($('#lblOeffnungFreitag').text().replace(/<b>(.|\n)*<\/b>/gm, '').trim().split(' '))[1].split('-') : 0,
      ];

      const tds = $('#GridViewPlatzstrukturen tbody tr').eq(1).children('td');

      data.data[ki].structure = {
        overall: parseInt(tds.eq(0).text(), 10),
        under: parseInt(tds.eq(1).text(), 10),
        over: parseInt(tds.eq(2).text(), 10),
        min: parseInt(tds.eq(3).text(), 10),
        mix: tds.eq(4).text().trim(),
      };

      data.data[ki].places = []

      if ($('#GridViewFreiPlaetze tbody tr td').length > 1) {
        const rows = $('#GridViewFreiPlaetze tbody tr');
        for (let i = 1; i < rows.length; i += 1) {
          const fields = rows.eq(i).children('td');
          data.data[ki].places.push({
            accept: fields.eq(0).text().trim(),
            all: fields.eq(1).text().trim(),
            over: fields.eq(2).text().trim(),
            under: fields.eq(3).text().trim(),
            hours: fields.eq(4).text().trim(),
            from: fields.eq(5).text().trim(),
            comment: fields.eq(6).text().trim(),
          });
        }
      }

      data.data[ki].jobs = [];

      if ($('#GridViewStellenangebote tbody tr td').length > 1) {
        const rows = $('#GridViewStellenangebote tbody tr');
        for (let i = 1; i < rows.length; i += 1) {
          const fields = rows.eq(i).children('td');
          data.data[ki].jobs.push({
            name: fields.eq(0).text().trim(),
            date: fields.eq(1).text().trim(),
          });
        }
      }

      geocoder.geocode({
        address: data.data[ki].address,
        country: 'Germany',
        zipcode: data.data[ki].postcode,
      }, (err, res) => {
        if (err) {
          errorCount += 1;
          if (errorCount > 50) {
            console.log('Too many errors');
            process.exit();
          }
          parseKitas();
        } else {
          data.data[ki].geo = {
            lat: res[0].latitude,
            lon: res[0].longitude,
          };
          data.data[ki].streetName = res[0].streetName;
          data.data[ki].streetNumber = res[0].streetNumber;

          // fs.writeFileSync('./individual/'+data.data[ki].id+'_kitas.json', JSON.stringify(data.data[ki]), 'utf8')

          ki += 1;
          progressBar.update(ki);
          if (ki >= data.data.length) {
            fs.renameSync('./data/kitas.json', `archive/${old.date}_kitas.json`);
            fs.writeFileSync('./data/kitas.json', JSON.stringify(data), 'utf8');
            process.exit();
          } else {
            parseKitas();
          }
        }
      });
    } else {
      errorCount += 1;
      if (errorCount > 50) {
        console.log('Too many errors');
        process.exit();
      }
      parseKitas();
    }
  });
}

request.get('https://www.berlin.de/sen/jugend/familie-und-kinder/kindertagesbetreuung/kitas/verzeichnis/ListeKitas.aspx?aktSuchbegriff=', (error, response, body) => {
  if (!error && response.statusCode === 200) {
    $ = cheerio.load(body);

    $('#DataList_Kitas tbody td').each((i, elem) => {
      const el = $(elem),
        link = el.children('a').attr('href'),
        idParam = link.split('?ID=')[1],
        id = parseInt(idParam.trim(), 10);

      let num = '',
        parent = '',
        address = '',
        district = '';

      el.children('span').each((spanIndex, span) => {
        const $span = $(span),
          elId = $span.attr('id'),
          text = $span.text();

        if (elId && elId.length > 1) {
          if (elId.indexOf('KitaNr') >= 0) {
            num = parseInt(text, 10);
          } else if (elId.indexOf('TraegerName') >= 0) {
            parent = text.trim();
          } else if (elId.indexOf('KitaAdresse') >= 0) {
            address = text.trim();
          } else if (elId.indexOf('Ortsteil') >= 0) {
            district = text.trim();
          }
        }
      });

      data.data.push({
        id,
        link,
        num,
        parent,
        address,
        district,
      });

      keys[id] = data.data.length - 1;
    });

    fs.renameSync('./data/kitas_keys.json', `archive/${old.date}_kitas_keys.json`);
    fs.writeFileSync('./data/kitas_keys.json', JSON.stringify(keys), 'utf8');

    progressBar.start(data.data.length, 0);

    parseKitas();
  } else {
    console.log(error, response.statusCode);
  }
});
