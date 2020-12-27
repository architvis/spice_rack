// Copy and past into a browser to generate json code
var code = "";

function addRow(idStart, n,rotationOffset, centerOffset,appending=false){
    var radius = 360/n;
    var id = idStart;
    
    if(appending==true) code += ",\n";

    for(var i =0; i<n; i++){
        code+=`{"uid": ${id++}, "name":"", "contents": "-1", "rotation": ${(radius*i)+rotationOffset}, "radiusDistance": ${centerOffset}}${(i==n-1) ? "":",\n"}`;
    }
}

// Example, uncomment to use
// addRow(0,7,0,100);
// addRow(7,7,25.71,200, true);

console.log(code);
