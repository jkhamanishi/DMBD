window.onload = function() {
  document.getElementById('upload').addEventListener('change', handleFileSelect, false);
};

function showCode(code){
  // document.getElementById("output_code").innerText = code
  document.getElementById("output_code").innerHTML = code
}

function insertIntoIframe(html_code){
  document.getElementById("output_html").contentDocument.write(html_code);
}

const SIZE = 76;

const HEAD = `
<head>		
	<link rel="stylesheet" type="text/css" href="wordpressSIMULATOR.css"><!--- This is for offline testing --->	
</head>		
<body>		
<p>Click a box to see details</p>&nbsp;		
		
<div style="height: auto; overflow: auto">		
	<table>	
		<tbody style="">
`

const START_ROW = `
			<tr id="row1" style="border-style:hidden; background-color: white;">
`
const END_ROW = `
			</tr>
`
const INDENT = `
				<td nowrap="nowrap" colspan="1" style="padding: 0px; width: ${SIZE/2}px" ></td>
`
const EMPTY_BOX = `
				<td nowrap="nowrap" colspan="2" style="padding: 0px; width: ${SIZE/2}px" ></td>
`

const START_BOX = `
				<td nowrap="nowrap" colspan="2" style="padding: 0px"><div style="width: 76px"><div class="featured-media">
`
const END_BOX = `
				</div></div></td>
`

const EMPTY_ROW = `
			<tr id="row0" style="border-style:hidden; background-color: white;">`+`
				<td nowrap="nowrap" colspan="1" style="padding: 0px; width: 38px" ></td>`.repeat(88)+`
			</tr>
`
const FOOT = `
		</tbody>
	</table>	
	&nbsp;	
</div>		
<p><strong>Pro Tip: </strong>you can scroll sideways with your mouse wheel by holding [Shift]</p>		
</body>		
`

var ExcelToJSON = function() {
  this.parseExcel = function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: 'binary'
      });
      
      var box_data = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['box_data']);
      box_data = [null].concat(box_data)
      console.log(box_data);
      
      var layout = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['layout']);
      console.log(layout);
      
      var code = HEAD;
      
      for (const row of layout) {
        code += START_ROW;
        if (row.indent == "TRUE") {
          code += INDENT;
        }
        for (let i = 1; i <= 44; i++) {
          box_num = row['col_'+i]
          if (box_num) {
            let name = box_data[box_num]['name']
            let year = box_data[box_num]['grade 10 year']
            let page = box_data[box_num]['box page link']
            let img = box_data[box_num]['image file location']
            
            
            code += START_BOX;
            code += `					<a href="${page}" target="_blank"><img src="${img}"`+
            `title="Box ${box_num}: ${name} (${year})" /></a>`
            code += END_BOX;
          } else {
            code += EMPTY_BOX;
          }
        }
        code += END_ROW;
      }
      
      code += EMPTY_ROW;
      code += FOOT;
      showCode(code);
      insertIntoIframe(code);
    };
    reader.onerror = function(ex) {console.log(ex)};
    reader.readAsBinaryString(file);
  };
};

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
}












