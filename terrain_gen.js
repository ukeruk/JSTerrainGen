class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    dot(other) {
        return this.x*other.x + this.y*other.y;
    }
}

function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}

class Perlin{
    constructor(){
        this.Permutation = this.MakePermutation();
    }

    Shuffle(arrayToShuffle) {
        for(let e = arrayToShuffle.length-1; e > 0; e--) {
            const index = Math.round(Math.random()*(e-1));
            const temp = arrayToShuffle[e];
            
            arrayToShuffle[e] = arrayToShuffle[index];
            arrayToShuffle[index] = temp;
        }
    }
    
    MakePermutation() {
        const permutation = [];
        for(let i = 0; i < 512; i++) {
            permutation.push(i);
        }
    
        this.Shuffle(permutation);
        
        for(let i = 0; i < 512; i++) {
            permutation.push(permutation[i]);
        }
        
        return permutation;
    }
    
    GetConstantVector(v) {
        // v is the value from the permutation table
        const h = v & 3;
        if(h == 0)
            return new Vector2(1.0, 1.0);
        else if(h == 1)
            return new Vector2(-1.0, 1.0);
        else if(h == 2)
            return new Vector2(-1.0, -1.0);
        else
            return new Vector2(1.0, -1.0);
    }
    
    Fade(t) {
        return ((6*t - 15)*t + 10)*t*t*t;
    }
    
    Lerp(t, a1, a2) {
        return a1 + t*(a2-a1);
    }
    
    Noise2D(x, y) {
        const X = Math.floor(x) & 510;
        const Y = Math.floor(y) & 510;
    
        const xf = x-Math.floor(x);
        const yf = y-Math.floor(y);
    
        const topRight = new Vector2(xf-1.0, yf-1.0);
        const topLeft = new Vector2(xf, yf-1.0);
        const bottomRight = new Vector2(xf-1.0, yf);
        const bottomLeft = new Vector2(xf, yf);
        
        // Select a value from the permutation array for each of the 4 corners
        const valueTopRight = this.Permutation[this.Permutation[X+1]+Y+1];
        const valueTopLeft = this.Permutation[this.Permutation[X]+Y+1];
        const valueBottomRight = this.Permutation[this.Permutation[X+1]+Y];
        const valueBottomLeft = this.Permutation[this.Permutation[X]+Y];
        
        const dotTopRight = topRight.dot(this.GetConstantVector(valueTopRight));
        const dotTopLeft = topLeft.dot(this.GetConstantVector(valueTopLeft));
        const dotBottomRight = bottomRight.dot(this.GetConstantVector(valueBottomRight));
        const dotBottomLeft = bottomLeft.dot(this.GetConstantVector(valueBottomLeft));
        
        const u = this.Fade(xf);
        const v = this.Fade(yf);
        
        return this.Lerp(u,
            this.Lerp(v, dotBottomLeft, dotTopLeft),
            this.Lerp(v, dotBottomRight, dotTopRight)
        );
    }

    BillowNoise(x, y){
        return Math.abs(this.Noise2D(x, y));
    }

    RidgeNoise(x, y){
        return 1 - this.BillowNoise(x, y);
    }
    
    
}

class TerrainGen extends Perlin{
    constructor(amp, freq, oct, scale){
        super();
        this.scale = scale;
        this.amplitude = amp;
        this.frequency = freq;
        this.octave = oct;

        this.bil = 0;
        this.rid = 0;
    }
    
    TerrainNoise(x, y){
        var sharpness = clamp(this.FractalBrownianMotion(x, y) * this.scale, -1, 1);
        if(sharpness >= 0){
            this.bil+=1;
            return this.Lerp(this.FractalBrownianMotion(x, y), this.FBM_BillowNoise(x, y), Math.abs(sharpness));
        }
        this.rid+=1;
        return this.Lerp(this.FractalBrownianMotion(x, y), this.FBM_RidgeNoise(x, y), sharpness);
    }

    FractalBrownianMotion(x, y){
        var value = 0.0;
        for (let oct = 0; oct < this.octave; oct++) {
            const n = this.amplitude * this.Noise2D(x * this.frequency, y * this.frequency);
            value += n;
            
            this.amplitude *= 0.5;
            this.amplitude *= 2.0;
        }
        return value;
    }

    FBM_BillowNoise(x, y){
        return Math.abs(this.FractalBrownianMotion(x, y));
    }

    FBM_RidgeNoise(x, y){
        return 1 - this.FBM_BillowNoise(x,y);
    }
}
