
let xValues = [10, 28, 34, 39, 47, 57, 51];
let yValues = [10, 43, 78, 70, 87, 70, 70];
let zValues = [0, 15, 44, 31, 40, 13, 19];
let targets = [20, 63, 86, 93, 93, 88, 87];




let highestAccuracy = -Infinity; 

let resolutions = 400; 

for (let i = 0; i < resolutions; i++) {
    let xWeight = (-(resolutions/2) + i)/(resolutions/2); 

    for (let j = 0; j < resolutions; j++) {
        let yWeight = (-(resolutions/2) + j)/(resolutions/2); 

        for (let k = 0; k < resolutions; k++) {
            let zWeight = (-(resolutions/2) + k)/(resolutions/2); 
            let totalAccuracy = 0; 
            let accuracies = []; 

            for (let p = 0; p < xValues.length; p++) {
                const x = xValues[p];
                const y = yValues[p];
                const z = zValues[p];

                let result = claculatePR(x, y, z, [xWeight, yWeight, zWeight]); 
                let accuracy = getAccuracy(result, targets[p]); 
                accuracies.push(Math.round(accuracy)); 
                totalAccuracy += accuracy; 
            }
            totalAccuracy = totalAccuracy/xValues.length; 

            if(totalAccuracy > highestAccuracy){
                highestAccuracy = totalAccuracy; 

                console.log(`Highest Accuracy: ${highestAccuracy}`); 
                console.log(`Weights: x = ${xWeight}, y = ${yWeight}, z = ${zWeight}`); 
                console.log(`Accuracies: ${accuracies}`);
                console.log("---------------------- \n");
            }
        }
    }
}






function claculatePR(durationInFirstStage, totalDuration, durationInOther, weights){
    return durationInFirstStage * weights[0] + totalDuration * weights[1] + durationInOther * weights[2]; 
}

function getAccuracy(result, target){
    return 100 - Math.abs(result - target); 
}
