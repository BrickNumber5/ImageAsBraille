window.onload = ( ) => {
  let canvas = document.querySelector( ".canvas" ),
      ctx    = canvas.getContext( "2d" )
  txt =  document.querySelector( ".text" )
  document.querySelector( ".input" ).onchange = e => {
    var reader = new FileReader( )
    reader.onload = function( event ){
        var img = new Image( )
        img.onload = ( ) => {
            let scale = img.width > maxLineWidth ? maxLineWidth / img.width : 1
            canvas.width = img.width * scale
            canvas.height = img.height * scale
            ctx.drawImage( img, 0, 0, img.width * scale, img.height * scale )
            to1bpp( ctx, canvas.width, canvas.height )
            brailify( ctx, canvas.width, canvas.height )
        }
        img.src = event.target.result
    }
    reader.readAsDataURL( e.target.files[ 0 ] )
    document.querySelector( ".input-label" ).className = "input-label hide"
  }
}

const to1bpp = ( ctx, width, height ) => {
  imgData = ctx.getImageData( 0, 0, width, height )
  for ( let i = 0; i < width * height; i++ ) {
    let brightness = ( ( imgData.data[ i * 4 ] + imgData.data[ i * 4 + 1 ] + imgData.data[ i * 4 + 2 ] ) / 3 ) >= 128 ? 255 : 0
    imgData.data[ i * 4     ] = brightness
    imgData.data[ i * 4 + 1 ] = brightness
    imgData.data[ i * 4 + 2 ] = brightness
    imgData.data[ i * 4 + 3 ] = 255
  }
  ctx.putImageData( imgData, 0, 0 )
}

const brailify = ( ctx, width, height ) => {
  let widthF = Math.floor( width / 2 )
  let heightF = Math.floor( height / 4 )
  imgData = ctx.getImageData( 0, 0, width, height )
  let str = ""
  for ( let y = 0; y < heightF; y++ ) {
    for ( let x = 0; x < widthF; x++ ) {
      let code = 0x2800
      for ( let i = 0; i < 2; i++ ) {
        for ( let j = 0; j < 4; j++ ) {
          let idx = ( x * 2 + i ) + ( y * 4 + j ) * width
          let value = imgData.data[ idx * 4 ] / 255
          code += !value * ( 1 << posTable[ i ][ j ] )
        }
      }
      if ( code === 0x2800 ) code += 1 << posTable[ Math.floor( Math.random( ) * 2 ) ][ Math.floor( Math.random( ) * 4 ) ]
      str += String.fromCharCode( code )
    }
    if ( y === heightF - 1 ) break
    str += "\n"
  }
  txt.innerText = str
}

const posTable = [ [ 0, 1, 2, 6 ], [ 3, 4, 5, 7 ] ]

const maxLineWidth = 100

let txt