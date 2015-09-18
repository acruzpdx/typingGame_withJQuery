var view = (function() {
//------Constants------
    var YOU_LOST_MSG = "Sorry, you lost! Please click to try again!";
    var CONGRATULATIONS_MSG = "Congratulations! You Won! Please click to play again!";
    var MAX_SCREEN_BLOCKS = 10;


//------Variables------
    var myController = null;

    // Array to hold the DOM elements representing the blocks on the screen
    var screenBlock = [null,null,null,null,null,null,null,null,null,null];

    // Array to hold index values to slots that are ready to be filled with
    // new blocks in the screenBlock array. If this array is empty, it means
    // that all available screenBlock slots are filled and no new blocks can
    // be created until an existing one is eliminated and its index is added
    // to the availableScreenBlockIndex array.
    var availableScreenBlockIndex = [0,1,2,3,4,5,6,7,8,9];
    
    // UI Variables
    var $gameBoard = $("#gameBoard");
    var $footer = $("#footerId");

    // How many pixels down the screen the block should be moved.
    var dropIncrement = 5;
    
    var stringToTest = "";


    //------Private Functions------
    function _makeBlock(data,slot) {
        var $tempBlock = $("<div>");

        $tempBlock.html(data);
        $tempBlock.addClass("block");
        $tempBlock.css('left',"" + (slot*10) + "%");
        $tempBlock.css('bottom', 85 + "%");
        $gameBoard.append($tempBlock);
        screenBlock[slot] = $tempBlock;
    }
    function _keyPressHandler(e) {
        var character;

        e.preventDefault();
        if ('charCode' in e) {
            character = e.charCode;
        } else {
            character = e.keyCode;
        }
        processCharacter(String.fromCharCode(character));
        if (myController.isGameOver() == true) {
            myController.stopGame();
            modalMsgBox(CONGRATULATIONS_MSG);
         }
    }
    //------Public Functions------
    function setController(c) {
        myController = c;
    }
    function modalMsgBox(msg) {
        var $overlay;
        var $mmBox;
        
        $overlay = $("<div>");
        $overlay.addClass("overlay");
        $mmBox = $("<div>");
        $mmBox.addClass("msgBox");
        $mmBox.html(msg);
        $overlay.append($mmBox);
        $(document.body).append($overlay);
        $overlay.on("click", function() {
            $overlay.remove();
            controller.startGame();
        });
    }
    function removeKeypressListener() {
        $(document).off("keypress",_keyPressHandler);
    }
    function addKeypressListener() {
        // Set up keyboard event listener
        $(document).on("keypress",_keyPressHandler);
    }
    function processCharacter(s) {
        var i;
        var found = false;

        if (s === ' ') {
            stringToTest = "";
            $footer.html("");
        } else {
            stringToTest = stringToTest + s;
            $footer.html(stringToTest);
            for (i = 0; i < screenBlock.length && (!found); i++) {
                if ((screenBlock[i] != null) && ($(screenBlock[i]).html() === stringToTest)) {
                    found = true;
                    //$(screenBlock[i]).parent().remove($(screenBlock[i]));
                    $(screenBlock[i]).remove();
                    screenBlock[i] = null;
                    availableScreenBlockIndex.push(i);
                    stringToTest = "";
                    //footer.innerHTML = "";
                    $footer.html("");
                    controller.incrementDestroyedBlockCount();
                }
            }
        }
    }
    function existsEmptySlotInAvailableBlockIndexArray() {
        if (availableScreenBlockIndex.length != 0) {
            return true;
        } else {
            return false;
        }
    }
    function addBlock () {
        var blockData = null;
        var availableSlot = null;
        
        blockData = myController.getData();
        availableSlot = availableScreenBlockIndex.shift();
        _makeBlock(blockData,availableSlot);
        myController.incrementCreatedBlockCount();
    }
    function advanceExistingScreenBlocks() {
        var i,
            old_bottom_position,
            new_bottom_position,
            $element;
        
        for (i=0; i < screenBlock.length; i++) {
            if ((screenBlock[i] != null) &&
                (myController.isGameOver() === false)) {
                $element = $(screenBlock[i]);
                old_bottom_position = parseInt($element[0].style.bottom);
                new_bottom_position = old_bottom_position - dropIncrement;
                if (new_bottom_position <= 0) {
                    myController.setUserLost();
                    myController.stopGame();
                    modalMsgBox(YOU_LOST_MSG);
                } else {
                    $element[0].style.bottom =  new_bottom_position + "%";
                }
            }
        }
        
    }
    function resetArrays() {
        var i;
        for (i = 0; i < MAX_SCREEN_BLOCKS; i++) {
           if (screenBlock[i] != null) {
                $(screenBlock[i]).remove();
            }
            screenBlock[i] = null;
            availableScreenBlockIndex[i] = i; 
        }
    }
    function scrambleAvailableBlockIndexArray() {
        var temp;
        var i;
        var swap_position;
        for (i = 0; i < availableScreenBlockIndex.length; i++) {
            swap_position = Math.floor( (Math.random() * (availableScreenBlockIndex.length -1)));
            temp = availableScreenBlockIndex[i];
            availableScreenBlockIndex[i] = availableScreenBlockIndex[swap_position];
            availableScreenBlockIndex[swap_position] = temp;
        }
        
    }
    //------Expose Public Functions------
    return {
        setController : setController,
        addKeypressListener : addKeypressListener,
        removeKeypressListener : removeKeypressListener,
        existsEmptySlotInAvailableBlockIndexArray : existsEmptySlotInAvailableBlockIndexArray,
        advanceExistingScreenBlocks : advanceExistingScreenBlocks,
        addBlock : addBlock,
        resetArrays: resetArrays,
        scrambleAvailableBlockIndexArray : scrambleAvailableBlockIndexArray
    }
    
})();
