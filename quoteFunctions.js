const Regex = require('regex');
const fs = require('fs');

var regex = /[!"#$%&'()*+-,./:;<=>?@[\]^_`{|}~]/g;


module.exports = {
    checkInitialQuote: function(scriptLength) {

        let randomNumber;
        let loop = 1;
        const data = JSON.parse(fs.readFileSync('swscripts/rotsscript.json'));
        while (loop === 1) {
            
            randomNumber = Math.floor(Math.random() * scriptLength);
            let randomQuote = data.ROTSSCRIPT[randomNumber];
            let quote = randomQuote.quote;

            if (quote.indexOf(':') > 0) {
                loop = 0;
            }   
        }

        return randomNumber;
    },
    checkSecondQuote: function(randomNumber, quote, message) {
        
        const data = JSON.parse(fs.readFileSync('swscripts/rotsscript.json'));

        let loop = 1;

        while (loop === 1) {
        
            randomNumber++;
            quoteBelowRaw = data.ROTSSCRIPT[randomNumber];
            quoteBelow = quoteBelowRaw.quote;

            if (quoteBelow.indexOf(':') > 0) {
                loop = 0;
            }
        }
        return quoteBelow;
    },
    sliceName: function(quoteBelow) {
        let test = quoteBelow.indexOf(':');
        let quoteBelowAnswer = quoteBelow.slice(test + 2);
        return quoteBelowAnswer;
    },

    strippingArray: function(array) {
        
        let temp = array.join(" ");
        let tempLower = temp.toLowerCase();
        let temp2 = tempLower.replace(regex, '');
        let temp3 = temp2.trim().split(" ");
        let temp4 = temp3.filter(Boolean);

        return temp4;
    },

    noDuplicates: function(strippedArray) {
        
        let checker = [];

        for (let i = 0; i < strippedArray.length; i++) {
            if (checker.indexOf(strippedArray[i]) === -1) {
                checker.push(strippedArray[i]);
            }
        }
        return checker;
    },
    compareAnswers: function(checkerAnswer, checkerMessage) {
        
        let forLoop;
        let counter = 0;

        if (checkerMessage.length < checkerAnswer.length) {
            forLoop = checkerMessage.length;
        } else {
            forLoop = checkerAnswer.length;
        }

        for (let i = 0; i < forLoop; i++)
        {
            for (let j = 0; j < checkerAnswer.length; j++)
            {
                if (checkerMessage[i] === checkerAnswer[j]) {
                    counter++;
                }
            }
        }
        return (counter);
    },
    onlyDuplicates: function(strippedArrayMessage) {

        let tempArray = [];
        let duplicateArray = [];
        for (let i = strippedArrayMessage.length - 1; i >= 0; i--) {
            if (tempArray.indexOf(strippedArrayMessage[i]) === -1) {
                tempArray.push(strippedArrayMessage[i]);
            } else {
                duplicateArray.push(strippedArrayMessage[i]);
            }
            console.log(duplicateArray);
            return duplicateArray;
        }
    },
    percentage: function(counter, checkerAnswer, cooldown) {

        let percent = ( (counter ) / checkerAnswer.length) * 100;
    
        return percent;
    }
}