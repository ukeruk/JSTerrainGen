const size = 1500;
var ns;
var terrain_layer_1 = new TerrainGen(0.5, 0.0002, 16, 2/(120-20));

height_map = [];
x_random = Math.floor(Math.random() * 200);
y_random = Math.floor(Math.random() * 200);

for (let x = 0; x < size; x++) {
    height_map[x] = [];
    for (let y = 0; y < size; y++) {
        let flat_layer = terrain_layer_1.FractalBrownianMotion((x+x_random)/size, (y+y_random)/size);
        height_map[x][y] = 70 + Math.floor(flat_layer * 50);
    }
}
console.log("Billow - "+terrain_layer_1.bil + " | Ridge - "+terrain_layer_1.rid);
const canvas = document.getElementById("bitmap");
const ctx = canvas.getContext("2d");

for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
        if(height_map[x][y] < 40){
            ctx.fillStyle = `rgb(0, 0, ${height_map[x][y]*2})`;
        }
        else if(height_map[x][y] < 110){
            ctx.fillStyle = `rgb(0, ${height_map[x][y]}, ${height_map[x][y]*0.5})`;
        }
        else{
            ctx.fillStyle = `rgb(${height_map[x][y]}, ${height_map[x][y]}, ${height_map[x][y]})`;
        }
        ctx.fillRect(x, y, 1, 1);
    }
}