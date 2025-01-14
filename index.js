function fetchJSONFile(fileName) {
    return fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`${response.status}: Error fetching ${fileName}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`There was an error fetching ${fileName}:`, error);
        });
}

let sets; 
let dataSetContainer = document.getElementById("dataSets"); 

Promise.all([
    fetchJSONFile('set_1.json'),
    fetchJSONFile('set_2.json'),
    fetchJSONFile('set_3.json'),
    fetchJSONFile('set_4.json'),
    fetchJSONFile('set_5.json'),
    fetchJSONFile('set_6.json'),
    fetchJSONFile('set_7.json'),
    fetchJSONFile('set_8.json'),
    fetchJSONFile('set_9.json'),
    fetchJSONFile('set_8.json')
]).then(([set1, set2, set3, set4, set5, set6, set7, set8]) => {

    sets = {set1, set2, set3, set4, set5, set6, set7, set8}; 


}).catch(error => {
    console.error('Error fetching one or more JSON files:', error);
});

document.getElementById("addDataSet").addEventListener("click", () => addDataSet())

function addDataSet(){
    
    let newBlock = document.getElementById("block").cloneNode(true); 
    let random = Math.floor(Math.random() * 1000000);
    newBlock.id += random; 
    newBlock.querySelector('[name="removeSet"]').id += random;
    newBlock.querySelector('[name="selectSet"]').id += random;
    
    newBlock.style.display = "";
    
    dataSetContainer.appendChild(newBlock); 

    let selectSet = document.getElementById(`selectSet${random}`);
    
    Object.entries(sets).map(item => item[1])
                        .forEach(set => {
        let option = document.createElement('option');
        option.value = set.name;
        option.innerHTML = set.name;
        selectSet.appendChild(option);
    });
    


    selectSet.addEventListener("change", (e) => useData(e.target.value, random))
}

function clearSet(ramdomId){
    let block = document.getElementById(`block${ramdomId}`);

    block.querySelector('[name="setName"]').textContent = `Set Name:`
    block.querySelector('[name="sleepDuration"]').textContent = `Sleep Duration:`;

    let sleepStages = block.querySelector('[name="sleepStages"]');

    let targetsContainer = block.querySelector('[name="targets"]');
    let calculatedContainer = block.querySelector('[name="calculated"]');

    ["c", "t"].forEach(suffix => {
        ["PR", "RST", "MR", "CYL", "SC"].forEach(type => {
            calculatedContainer.querySelector(`[name="${suffix}${type}"]`).textContent = ""; 
        });
    });

    block.querySelector('[name="sleepData"] [name="awake"]').textContent = ``;
    block.querySelector('[name="sleepData"] [name="rem"]').textContent = ``;
    block.querySelector('[name="sleepData"] [name="light"]').textContent = ``;
    block.querySelector('[name="sleepData"] [name="deep"]').textContent = ``;


    ["bAwake", "bRem", "bLight", "bDeep"].forEach(type => {
        block.querySelector(`[name="stages"] [name="${type}"]`).style.width = `20px`;
        block.querySelector(`[name="stages"] [name="${type}"]`).style.right = `calc(50% - 10px)`;
    });


    let accuracyContainer = block.querySelector('[name="accuracy"]'); 

    accuracyContainer.querySelector('[name="PR"]').style.width = `${100}%`;
    accuracyContainer.querySelector('[name="RST"]').style.width = `${100}%`;
    accuracyContainer.querySelector('[name="MR"]').style.width = `${100}%`;
    accuracyContainer.querySelector('[name="CYL"]').style.width = `${100}%`;
    accuracyContainer.querySelector('[name="SC"]').style.width = `${100}%`;




    while (sleepStages.firstChild) {
        sleepStages.removeChild(sleepStages.firstChild);
    }
    

}

function useData(setName, ramdomId){
    clearSet(ramdomId); 

    let set = Object.entries(sets).map(item => item[1])
                    .filter(item => item.name === setName)[0]; 
    if(!set) return; 

    let block = document.getElementById(`block${ramdomId}`);
    let totalDuration = set.data.map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);

    let totalAwakeDuration = set.data.filter(item => item.type === "awake")
                                .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);
    let totalRemDuration = set.data.filter(item => item.type === "REM sleep")
                                .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);
    let totalLightDuration = set.data.filter(item => item.type === "light sleep")
                                .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);
    let totalDeepDuration = set.data.filter(item => item.type === "deep sleep")
                                .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                                .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);


    block.querySelector('[name="setName"]').textContent = `Set Name: ${set.name}`
    block.querySelector('[name="sleepDuration"]').textContent = `Sleep Duration: ${set.data[0].startTime} - ${set.data[set.data.length-1].startTime} (${Math.floor(totalDuration/60)}h ${totalDuration % 60}m)`;

    let sleepStages = block.querySelector('[name="sleepStages"]');

    let calculatedContainer = block.querySelector('[name="calculated"]');

    calculatedContainer.querySelector('[name="tPR"]').textContent += set.targets.PR; 
    calculatedContainer.querySelector('[name="tRST"]').textContent += set.targets.RST; 
    calculatedContainer.querySelector('[name="tMR"]').textContent += set.targets.MR; 
    calculatedContainer.querySelector('[name="tCYL"]').textContent += set.targets.CYL; 
    calculatedContainer.querySelector('[name="tSC"]').textContent += set.targets.SC; 

    let awakePercentage = Math.round((totalAwakeDuration/totalDuration)*100);
    let remPercentage = Math.round((totalRemDuration/totalDuration)*100);
    let lightPercentage = Math.round((totalLightDuration/totalDuration)*100);
    let deepPercentage = Math.round((totalDeepDuration/totalDuration)*100);


    block.querySelector('[name="sleepData"] [name="awake"]').textContent = `(${awakePercentage}%)`;
    block.querySelector('[name="sleepData"] [name="rem"]').textContent = `(${remPercentage}%)`;
    block.querySelector('[name="sleepData"] [name="light"]').textContent = `(${lightPercentage}%)`;
    block.querySelector('[name="sleepData"] [name="deep"]').textContent = `(${deepPercentage}%)`;

    let awakeRange = [0, 10];
    let remRange = [19, 27];
    let lightRange = [45, 60];
    let deepRange = [10, 12];

    let awakeDifference = calculateDiff(awakePercentage, awakeRange);  
    let remDifference = calculateDiff(remPercentage, remRange);  
    let lightDifference = calculateDiff(lightPercentage, lightRange);  
    let deepDifference = calculateDiff(deepPercentage, deepRange); 

    
    drawBar("Awake", awakeDifference);
    drawBar("Rem", remDifference);
    drawBar("Light", lightDifference);
    drawBar("Deep", deepDifference);


    function drawBar(type, diff){
        if(diff > 3) diff = 3; 
        if(diff === 0){
            block.querySelector(`[name="stages"] [name="b${type}"]`).style.width = `20px`;
            block.querySelector(`[name="stages"] [name="b${type}"]`).style.right = `calc(50% - 10px)`;
            return; 
        }
        block.querySelector(`[name="stages"] [name="b${type}"]`).style.width = `${Math.abs(diff) * 16.6666}%`;
        block.querySelector(`[name="stages"] [name="b${type}"]`).style.right = `${50 - (diff < 0 ? 0 :  diff * 16.6666)}%`
    }

    // console.log(totalAwakeDuration); 
    // console.log(totalRemDuration); 
    // console.log(totalLightDuration); 
    // console.log(totalDeepDuration); 
    console.log("------------"); 



    set.data.forEach(item => {
        let duration = parseInt(item.duration.substring(0, item.duration.length-1));
        let newStage = document.createElement("div"); 
        let color; 
        switch (item.type) {
            case "awake":
                color = "orange";
            break;
            case "REM sleep":
                color = "rgb(71, 227, 255)";
            break;
            case "light sleep":
                color = "rgb(71, 120, 255)";
            break;
            case "deep sleep":
                color = "rgb(44, 72, 151)";
            break;
        }
        newStage.style.backgroundColor = color;
        newStage.style.width = `${(duration/totalDuration)*100}%`;
        newStage.style.height = "20px";
        sleepStages.appendChild(newStage);
    });
    let CYL = calculateCycles(set.data); 
    let PR = claculatePR(set);
    let RST = claculateRST(set, totalDuration);
    let MR = claculateMR(set, totalRemDuration, remPercentage, remRange)

    let SC = claculateFinalScore(PR, RST, MR); 

    // console.log(CYL);


    calculatedContainer.querySelector('[name="cPR"]').textContent += Math.round(PR); 
    calculatedContainer.querySelector('[name="cRST"]').textContent += Math.round(RST); 
    calculatedContainer.querySelector('[name="cMR"]').textContent += Math.round(MR); 
    calculatedContainer.querySelector('[name="cCYL"]').textContent += Math.round(CYL.length); 
    calculatedContainer.querySelector('[name="cSC"]').textContent += Math.round(SC); 

    let accuracyContainer = block.querySelector('[name="accuracy"]'); 

    accuracyContainer.querySelector('[name="PR"]').style.width = `${100 - Math.abs(PR - set.targets.PR)}%`;
    accuracyContainer.querySelector('[name="RST"]').style.width = `${100 - Math.abs(RST - set.targets.RST)}%`;
    accuracyContainer.querySelector('[name="MR"]').style.width = `${100 - Math.abs(MR - set.targets.MR)}%`;
    accuracyContainer.querySelector('[name="CYL"]').style.width = `${100 - Math.abs(CYL.length - set.targets.CYL)*10}%`;
    accuracyContainer.querySelector('[name="SC"]').style.width = `${100 - Math.abs(SC - set.targets.SC)}%`;





}

function calculateDiff(percentage, range){
    return  Math.ceil((percentage > range[1] ? percentage - range[1] :
            percentage < range[0] ? percentage - range[0] :
            0) / (range[1] - range[0])); 
}
function calculateDiffBasic(percentage, range){
    return  (percentage > range[1] ? percentage - range[1] :
            percentage < range[0] ? percentage - range[0] :
            0)
}

function claculatePR(set, firstCycleDuration){

    // Previous weights
    // let wFirst = 2.98; 
    // let wTotal = -1.19;
    // let wOther = 1.82;


    //The wtf method
    let wFirst = 0.375;
    let wTotal = 0.995;
    let wOther = -0.1;

    let durationInFirstStage = 0; 
    let totalDuration; 
    let durationInOther; 

    totalDuration = set.data.filter(item => item.type === "deep sleep")
                            .map(item => (parseInt(item.duration.substring(0, item.duration.length-1))))
                            .reduce((accumulator, currentValue) => {return accumulator + currentValue},0);

    // let firstDeepSleep;

    for (let i = 0; i < set.data.length; i++) {
        const item = set.data[i];
        if(item.type ==="REM sleep") break;
        if(item.type === "deep sleep"){
            durationInFirstStage += parseInt(item.duration.replace('m', ''))
        }   
    }


    
    durationInOther = totalDuration - durationInFirstStage; 
    
    console.log([durationInFirstStage, totalDuration, durationInOther]); 

    
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
                if( set.data[index +1].type === "awake" && 
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
                cycleDuration = 0;  // Reset cycle duration at the start of a new cycle
                remPhaseDetected = false;  // Reset REM detection when entering a new cycle
            }
            cycleDuration += parseInt(entry.duration.replace('m', ''), 10);  // Accumulate cycle duration
            currentAwakeDuration = 0;  // Reset awake counter when back in sleep phases
        } else if (entry.type === "awake") {
            currentAwakeDuration += parseInt(entry.duration.replace('m', ''), 10);
            if (currentAwakeDuration >= awakeThreshold && remPhaseDetected) {
                inCycle = false;  // End the cycle after long wake period and a prior REM phase
                cycleDurations.push(cycleDuration);  // Push the completed cycle duration
            }
        }
        if (entry.type === "REM sleep") {
            remPhaseDetected = true;  // Mark that REM sleep has been detected for this cycle
        }
    });

    // Ensure to capture the final cycle duration if still in a cycle
    if (inCycle && cycleDuration > 0) {
        cycleDurations.push(cycleDuration);
    }

    return cycleDurations;
}

function claculateFinalScore(physicalRecovery, restfulness, mentalRecovery){

    return (physicalRecovery + restfulness + mentalRecovery) /3 

}