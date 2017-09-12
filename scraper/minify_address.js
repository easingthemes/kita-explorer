var fs = require('fs')

var data = JSON.parse(fs.readFileSync('./data/address.geojson', 'utf8'))

var light = [], streets = [], street_keys = {}

data.features.forEach(d=>{
  if(!(d.properties.STRNAME in street_keys)){
    streets.push(d.properties.STRNAME)
    street_keys[d.properties.STRNAME] = streets.length - 1
  }
  light.push([
    d.properties.STRNAME,
    //remove leading zeros
    cleanHSNR(d.properties.HSNR),
    //Reduce precision of coordinates
    d.geometry.coordinates[0].toFixed(5),
    d.geometry.coordinates[1].toFixed(5)
  ])
})

fs.writeFileSync('./data/address.csv', array2csv(light, 'strname,hsnr,lon,lat'), 'utf8')

//Remove streetnames and organize in separate file

fs.writeFileSync('./data/streets.csv', array2csv(streets,'street'), 'utf8')
fs.writeFileSync('./data/streets.json', JSON.stringify(streets), 'utf8')

light.forEach((d,i)=>{
  light[i][0] = street_keys[light[i][0]]
})

fs.writeFileSync('./data/address.min.csv', array2csv(light, 'strname,hsnr,lon,lat'), 'utf8')
fs.writeFileSync('./data/address.min.json', JSON.stringify(light), 'utf8')

function cleanHSNR(n){
  while(n.substring(0,1)=='0'){
    n = n.substring(1)
  }
  return n
}

function array2csv(data,head){
  var csv = head

  data.forEach(d=>{
    csv += "\n"
    if( typeof d === 'array' ) {
      d.forEach((dd,ii)=>{
        if(ii>0){
          csv += ','
        }
        csv += dd
      })
    }else{
      csv += d
    }
  })

  return csv
}