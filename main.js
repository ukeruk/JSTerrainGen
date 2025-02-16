class Plain{
    /**
             * Format for block gen:
             * [BLOCK_NAME, possiblity_to_add]
             */
    constructor(){
        this.num_of_block = {
            Dirt: 10000,
            Water: 2000,
            Sand: 1000,
            Mud: 5
        };
        /**
         * Format is:
         * [0] = priority
         * [1:-1] = possible blocks
         */
        this.dirt = [
            1,
            "Dirt",
            "Sand",
            "Mud"
        ];

        this.sand = [
            2,
            "Dirt",
            "Sand",
            "Water"
        ];

        this.water = [
            3,
            "Water",
            "Sand"
        ];

        this.mud = [
            0,
            "Dirt",
            "Sand",
            "Water",
            "Mud"
        ]

        this.blocks = {Dirt:this.dirt, Sand:this.sand, Water:this.water, Mud:this.mud};
    }

    get_possible_blocks(block_name){
        var arr = [];
        for (let index = 1; index < this.blocks[block_name].length; index++) {
            arr.push(this.blocks[block_name][index]);
        }
        return arr;
    }

    get_prio(block_name){
        return this.blocks[block_name][0];
    }

    get_entropy(block_names) {
        var possible_blocks = [];
        //If multiple blocks are near the empty block, exclude possible blocks that don't match the other block possibilities
        possible_blocks.push(this.get_possible_blocks(block_names[0]));
        for (let index = 1; index < block_names.length; index++) {
            var temp_blocks = this.get_possible_blocks(block_names[index])
            possible_blocks.forEach(block => {
                if(!temp_blocks.includes(block)){
                    possible_blocks.splice(possible_blocks.indexOf(block), 1);
                }
            });
        }
        return possible_blocks.length;
    }

    collapse_block(block_names) {
        var sum = 0;
        var possible_blocks;
        var block_sizes = [];
        //If multiple blocks are near the empty block, exclude possible blocks that don't match the other block possibilities
        possible_blocks = this.get_possible_blocks(block_names[0]);
        for (let index = 1; index < block_names.length; index++) {
            var temp_blocks = this.get_possible_blocks(block_names[index])
            for (let el = 0; el < possible_blocks.length; el++) {
                if(!temp_blocks.includes(possible_blocks[el])){
                    possible_blocks.splice(el, 1);
                    el--;
                }
            }
        }
        for (let i = 0; i < possible_blocks.length; i++) {
            sum += this.num_of_block[possible_blocks[i]];
            block_sizes[i] = this.num_of_block[possible_blocks[i]];
        }

        var block_num = Math.floor(Math.random()*sum)+1;
        sum = 0;
        for (let i = 0; i < block_sizes.length; i++) {
            if(block_num <= sum+block_sizes[i]){
                this.num_of_block[possible_blocks[i]] += -1;
                
                return possible_blocks[i];
            }
            sum += block_sizes[i];
        }

    }
}

class Forest{
    /**
             * Format for block gen:
             * [BLOCK_NAME, possiblity_to_add]
             */  
}

class Swamp{

}

function check_is_edge(arr, x ,y){

    if((x > 0 && typeof arr[x-1][y] === 'undefined') || (y > 0 && typeof arr[x][y-1] === 'undefined') || 
       (x < chunk && typeof arr[x+1][y] === 'undefined') || (y < chunk && typeof arr[x][y+1] === 'undefined')){
        return true;
    }
    return false;
}  


function get_prio_edge(arr){
    var highest_prio = 0, highest_index = -1, temp_prio;
    for (let index = 0; index < arr.length; index++) {
        temp_prio = arr[index][2].get_prio([arr[index][3]]);
        if(temp_prio > highest_prio){
            highest_index = index;
            highest_prio = temp_prio;
        }
    }
    return highest_index;
}

function get_surrounding_blocks(arr, x, y){
    var block_names = [];
    if(x > 0 && typeof arr[x-1][y] !== 'undefined')
        block_names.push(arr[x-1][y][1]);
    if(x < chunk && typeof arr[x+1][y] !== 'undefined')
        block_names.push(arr[x+1][y][1]);
    if(y > 0 && typeof arr[x][y-1] !== 'undefined')
        block_names.push(arr[x][y-1][1]);
    if(y < chunk && typeof arr[x][y+1] !== 'undefined')
        block_names.push(arr[x][y+1][1]);
    if(block_names == [])
        console.log(arr, x ,y)
    return block_names;
}

function get_edge_point(arr, x, y){
    var new_x, new_y, temp_x, temp_y, min_entropy = 100, temp_entropy;
    for(let i=-1; i < 2; i++){
        for(let k = -1; k < 2; k++){
            if (k==i || Math.abs(k)+Math.abs(i)>1){
                continue;
            }
            temp_x = x + i;
            temp_y = y + k;
            if(temp_x < 0 || temp_x >= chunk || temp_y < 0 || temp_y >= chunk)
                continue;
            if(typeof arr[temp_x][temp_y] === 'undefined'){
                var surrounding_blocks = get_surrounding_blocks(arr, temp_x, temp_y);
                temp_entropy = arr[x][y][0].get_entropy(surrounding_blocks);
                if(temp_entropy < min_entropy){
                    new_x = temp_x;
                    new_y = temp_y;
                    min_entropy = temp_entropy;
                }
            }
        }
    }
    return [new_x, new_y];
}

var my_biomes = [];

const chunk = 50;

for (let k = 0; k < chunk; k++) {
    my_biomes[k] = [];
}

var edge_blocks = [];

var block_count = 0;
var plain = new Plain();
my_biomes[0][0] = [plain, plain.collapse_block(["Dirt"])];

block_count += 1;
//format is [x, y, biome=(0), block=(1)]
edge_blocks.push([0, 0, my_biomes[0][0][0], my_biomes[0][0][1]]);

var edge_index, edge_point, new_point;
while(block_count < 50*50){
    edge_index = get_prio_edge(edge_blocks);
    while(!check_is_edge(my_biomes, edge_blocks[edge_index][0], edge_blocks[edge_index][1])){
        edge_blocks.splice(edge_index, 1);
        edge_index = get_prio_edge(edge_blocks);
        if(edge_index == -1)
            break;
    }
    if(edge_index == -1)
            break;
    edge_point = get_edge_point(my_biomes, edge_blocks[edge_index][0], edge_blocks[edge_index][1]);
    new_point = [plain, plain.collapse_block(get_surrounding_blocks(my_biomes, edge_point[0], edge_point[1]))];
    my_biomes[edge_point[0]][edge_point[1]] = new_point;
    edge_blocks.push([edge_point[0], edge_point[1], new_point[0], new_point[1]]);
    block_count +=1;
}


const canvas = document.getElementById("bitmap");
const ctx = canvas.getContext("2d");

for (let x = 0; x < chunk; x++) {
    for (let y = 0; y < chunk; y++) {
        switch(my_biomes[x][y][1]){
            case "Dirt":
                ctx.fillStyle = "ForestGreen";
                break;
            case "Water":
                ctx.fillStyle = "DodgerBlue";
                break;
            case "Sand":
                ctx.fillStyle = "PaleGoldenRod";
                break;
            case "Mud":
                ctx.fillStyle = "Sienna";
        }
        ctx.fillRect(x*2, y*2, 2, 2);
    }
}
