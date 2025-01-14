function useData(setName, ramdomId){

    let set = Object.entries(sets).map(item => item[1])
                    .filter(item => item.name === setName)[0]; 
    if(!set) return; 

    let totalDuration = 0; //calculate total sleep duration

    let totalAwakeDuration = 0;
    let totalRemDuration = 0;
    let totalLightDuration = 0;
    let totalDeepDuration = 0;
    // calculate these

    let awakePercentage = Math.round((totalAwakeDuration/totalDuration)*100);
    let remPercentage = Math.round((totalRemDuration/totalDuration)*100);
    let lightPercentage = Math.round((totalLightDuration/totalDuration)*100);
    let deepPercentage = Math.round((totalDeepDuration/totalDuration)*100);

    let awakeRange = [0, 10];
    let remRange = [19, 27];
    let lightRange = [45, 60];
    let deepRange = [10, 12];

    let awakeDifference = calculateDiff(awakePercentage, awakeRange);  
    let remDifference = calculateDiff(remPercentage, remRange);  
    let lightDifference = calculateDiff(lightPercentage, lightRange);  
    let deepDifference = calculateDiff(deepPercentage, deepRange); 
    // 3 is too much and -3 is too little 0 is perfect


    let CYL = calculateCycles(set.data); 
    let PR = claculatePR(set);
    let RST = claculateRST(set, totalDuration);
    let MR = claculateMR(set, totalRemDuration, remPercentage, remRange)

    let SC = claculateFinalScore(PR, RST, MR); 

}

function calculateDiff(percentage, range){
    return  Math.ceil((percentage > range[1] ? percentage - range[1] :
            percentage < range[0] ? percentage - range[0] :
            0) / (range[1] - range[0]));

            //You can clamp it between -3 to 3 
}
function calculateDiffBasic(percentage, range){
    return  (percentage > range[1] ? percentage - range[1] :
            percentage < range[0] ? percentage - range[0] :
            0)
}

function claculatePR(set){

    // you need these shits 
    let wFirst = 0.375;
    let wTotal = 0.995;
    let wOther = -0.1;

    let durationInFirstStage = 0;// use the logic below to calculate this
    let totalDuration; 
    let durationInOther; 

    
    totalDuration = 0; //Calculate Total deep sleep duration

    for (let i = 0; i < set.data.length; i++) {
        const item = set.data[i];
        if(item.type ==="REM sleep") break;
        if(item.type === "deep sleep"){
            durationInFirstStage += parseInt(item.duration.replace('m', ''))
        }   
    }

    durationInOther = totalDuration - durationInFirstStage; 
      
    return durationInFirstStage * wFirst + totalDuration * wTotal + durationInOther * wOther; 
}

function claculateRST(set, totalDuration){

    totalDurationAwake = set.data.filter(item => item.type === "awake")
                                 .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                 .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);

    return 100 - (totalDurationAwake/totalDuration) * 100; 
}

function claculateMR(set, remDuration, remPercentage, remRange){
    let wDuration = 1.01894; 
    let wRangeDiff = 2.0579;
    let wDistrubtions = -1.675; 
    
    let distubtions = 0; 

    set.data.forEach((item, index) => {
        if(item.type === "REM sleep" && parseInt(item.duration.substring(0, item.duration.length-1)) >= 5){
            if(set.data[index +1]){
                if(set.data[index +1].type === "awake" && 
                    parseInt(set.data[index +1].duration.substring(0, set.data[index +1].duration.length-1)) > 3) distubtions++; 
            }
        }    
    });

    let diff = calculateDiffBasic(remPercentage, remRange)

    return remDuration * wDuration + Math.abs(diff) * wRangeDiff + distubtions * wDistrubtions; 
}


function calculateCycles(data) {
    let cycleDurations = [];
    let cycleDuration = 0;
    let inCycle = false;
    let currentAwakeDuration = 0;
    const awakeThreshold = 3;  // Minimum awake duration to reset a cycle
    let remPhaseDetected = false;

    data.forEach(entry => {
        if (["light sleep", "deep sleep", "REM sleep"].includes(entry.type)) {
            if (!inCycle) {
                inCycle = true;
                cycleDuration = 0;  
                remPhaseDetected = false;  
            }
            cycleDuration += parseInt(entry.duration.replace('m', ''), 10);  
            currentAwakeDuration = 0;  
        } else if (entry.type === "awake") {
            currentAwakeDuration += parseInt(entry.duration.replace('m', ''), 10);
            if (currentAwakeDuration >= awakeThreshold && remPhaseDetected) {
                inCycle = false;  
                cycleDurations.push(cycleDuration);  
            }
        }
        if (entry.type === "REM sleep") {
            remPhaseDetected = true;  
        }
    });

    if (inCycle && cycleDuration > 0) {
        cycleDurations.push(cycleDuration);
    }

    return cycleDurations;
}

function claculateFinalScore(physicalRecovery, restfulness, mentalRecovery){

    return (physicalRecovery + restfulness + mentalRecovery) /3 
}