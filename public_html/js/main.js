/*jsyaml is a global variable defined in js-yaml.min.js*/
var STARTING_HAND_SIZE = 6;
var o1,o2,o3,t1,t2,t3; //deck handles
var destruction;
var allDecks; 
var crewCards;
var tasks;
var blairSaucer;
var thousandMilesToCoast;
var player1Hand, player2Hand, thingHand;
var allHands;
var encounterDeck;

//these are pretty magical and definitely should be changed in the future
var MULTIP_THING_1 = 23;
var MULTIP_THING_2 = 24;
var MULTIP_HUMAN_1 = 25;
var MULTIP_HUMAN_2 = 26;
var MULTIP_HUMAN_3 = 27;

//URL is a string
//function loadFileAsString(URL) {
//    return $.ajax({
//                    url: URL,
//                    async: false
//                 }).responseText;
//}

// Get document, or throw exception on error
//function loadYAML() {
//    try {
//      //var str = loadFileAsString("/DeckSim/decks.yml");
//      //var doc = jsyaml.safeLoad(str);
//      loadFileAsJSONmodel("/DeckSim/decks.json");
//    } catch (e) {
//      document.getElementById("YAMLoutput").innerHTML = "YAML loading failed";
//      console.log(e);
//    }
//}

$(document).ready(function() {
    console.log( "ready!" );
    
    $('#drawModal').on('show.bs.modal', function (event) { 
        $('#cardIDinput').val('');
        var invokingButton = $(event.relatedTarget);
        var handTarget = invokingButton.attr('data-hand');
        
        $("#deckRadios").empty();
        for(var i=0; i < allDecks.length; i++) {
            //console.log("allDecks[" + i + "] = " +allDecks[i].name);
            if(i === 0) {
                $("#deckRadios").append("<label class='btn btn-default active'><input type='radio' name='options' data-cheating='"+allDecks[i].name+"' checked>"+ allDecks[i].name + "</label>");
            }
            else {
                $("#deckRadios").append("<label class='btn btn-default'><input type='radio' name='options' data-cheating='"+allDecks[i].name+"'>"+ allDecks[i].name + "</label>");
            }
        }
        
        //The unbind-then-bind trick was used because this listener was
        //executing twice for whatever reason
        $('#removeCardAcceptButton').unbind('click').bind('click', function () {
            //console.log("remove card button pressed!");
            var cardID = $("#cardIDinput").val();
            var deckString = $("#deckRadios input:radio:checked").attr('data-cheating');
            var deckObj = getDeckFromName(deckString);
            var handObj = getHandFromHTMLid(handTarget);
            if(cardID === "") {
                handObj.drawOne(deckObj);
            }
            else {
                handObj.drawSpecificCard(deckObj, cardID);
            }
        });
    });
    
    $('#chooseCharModal').on('show.bs.modal', function (e) {
        for(var i=0; i < crewCards.length(); i++) {
            $("#chooseCharacterBody").append("<button \n\
                                               style='margin:7px 15px 17px 0;' \n\
                                               type='button' \n\
                                               class='btn btn-success' \n\
                                               data-toggle='popover' \n\
                                               data-trigger='hover' \n\
                                               data-placement='top' \n\
                                               data-content='"+crewCards.get(i).desc+"'>"+
                                               crewCards.get(i).name+"</button>");
        }
        $('[data-toggle="popover"]').popover({html:true});
        var theModal = $(this);
        var invokingButton = $(e.relatedTarget);
        var handTarget = '#' + invokingButton.attr('data-hand');
        $('#chooseCharacterBody .btn-success').unbind('click').bind('click', function () {
            theModal.modal('hide');
            var removedCard = crewCards.removeCard($(this).html());
            $(handTarget).append("<button \n\
                                   id='crew"+removedCard.name+"' \n\
                                   style='margin:7px 15px 17px 0;' \n\
                                   type='button' \n\
                                   class='btn btn-success'\n\
                                   data-toggle='popover' \n\
                                   data-trigger='hover' \n\
                                   data-placement='top' \n\
                                   data-content='"+removedCard.desc+"'>"+
                                   removedCard.name+"</button>");
            $('[data-toggle="popover"]').popover({html:true});
            updateRecRoom();
            invokingButton.prop('disabled', true);
        });
        

    });
    
    $('#placeUnderModal').on('show.bs.modal', function (e) {
        var theModal = $(this);
        var invokingButton = $(e.relatedTarget);
        var invokingCardText = invokingButton.siblings().filter('.cardTextContainer').children().filter('.cardText').html();
        $('#chooseCardBody .btn').unbind('click').bind('click', function () {
            theModal.modal('hide');
            var pickedCardHTMLelement = $('#crew' + $(this).html());
            pickedCardHTMLelement.removeClass('btn-success').addClass('btn-warning');
            //var crewCardObj  = getCrewCardFromName($(this).html());
            placeTextUnderCard(invokingCardText, pickedCardHTMLelement);
            invokingButton.parent().remove();
        });
        
        $('#placeUnderBlairFromModal').unbind('click').bind('click', function () {
            theModal.modal('hide');
            placeTextUnderCard(invokingCardText,$('#blairSaucer'));
        });
    });
    
    $('#chooseCharModal').on('hidden.bs.modal', function () {
        $("#chooseCharacterBody").empty();
    });
    
    $('#dealStartingHandsButton').click(function () {
        dealStartingHands();
        $(this).prop('disabled', true);
    });
    
    $('#removeMultiInfectionCardsButton').click(function () {
        //there are two extra cards for a 4-player game
        t1.removeCard(MULTIP_THING_1);
        t1.removeCard(MULTIP_HUMAN_1);
        console.log("excess cards removed!");
        //now that these are removed, randomly remove one of the remaining cards...
        //First, generate a random number between 1 and 3
        var d3 = Math.floor((Math.random() * 3) + 1);
        switch(d3) {
            case 1:
                t1.removeCard(MULTIP_THING_2);
                console.log("thing card randomly selected and removed");
                break;
            case 2:
                t1.removeCard(MULTIP_HUMAN_2);
                console.log("human card  #2 randomly selected and removed");
                break;
            case 3:
                t1.removeCard(MULTIP_HUMAN_3);
                console.log("human card  #3 randomly selected and removed");
                break;
        }
        $(this).prop('disabled', true);
    });
    
    $('#drawEncounterCardButton').click(function () {
        drawEncounterCard();
    });
    
    $('#placeUnderBlairSaucer').unbind('click').click(function () {
        console.log("currEncounter" + $('#currEncounter').html());
        placeTextUnderCard($('#currEncounter').html(),$('#blairSaucer'));
        $('#encounterDeckArea').empty();
    });
    
    loadFileAsJSONmodel("/DeckSim/decks.json");
});

function placeTextUnderCard( text, DOMelementToUpdate ) {
    //console.log("placing under card...");
    //console.log("underCardName: " + underCardName);
    //console.log("HTMLelementToUpdate: " + HTMLelementToUpdate);
    var placeUnderText = "<br /><small>===" + text + "===</small>";
    var oldContent = DOMelementToUpdate.attr('data-content');
    console.log("adding text to button, oldContent = " + oldContent);
    DOMelementToUpdate.attr('data-content', oldContent + placeUnderText);
};

function drawEncounterCard() {
    $('#encounterDeckArea').empty();
    var topCard = encounterDeck.pop();
    $('#encounterDeckArea').append("<b id='currEncounter'>" + topCard.name + "</b>\n\
                                    <br />\n\
                                    <small>" + topCard.desc + "</small>");
}

function getCrewCardFromName( crewMemberName ) {
    for(var i=0; i < crewCards.length(); i++) {
        if(crewCards.get(i).name === crewMemberName) {
            console.log("crew card found:" + crewCards.get(i).name);
            return crewCards.get(i);
        }
    }
}

function getDeckFromName( name ) {
    for(var i=0; i < allDecks.length; i++) {
        if(allDecks[i].name === name) {
            return allDecks[i];
        }
    }
}

function getHandFromHTMLid( searchHTMLid ) {
    for(var i=0; i < allHands.length; i++) {
        if(allHands[i].HTMLid === searchHTMLid) {
            return allHands[i];
        }
    }
}

function initializeStandardDecks(json) {
    o1 = new StandardDeckModel("Outpost 31-Deck #1", "OutpostDeck1", json.OutpostDeck1.BaseCards);
    o1.standardInit();
    o2 = new StandardDeckModel("Outpost 31-Deck #2", "OutpostDeck2", json.OutpostDeck2.BaseCards);
    o2.standardInit();
    o3 = new StandardDeckModel("Outpost 31-Deck #3", "OutpostDeck3", json.OutpostDeck3.BaseCards);
    o3.standardInit();
    t1 = new StandardDeckModel("The Thing-Deck #1", "ThingDeck1", json.ThingDeck1.BaseCards);
    t1.standardInit();
    t2 = new StandardDeckModel("The Thing-Deck #2", "ThingDeck2", json.ThingDeck2.BaseCards);
    t2.standardInit();
    t3 = new StandardDeckModel("The Thing-Deck #3", "ThingDeck3", json.ThingDeck3.BaseCards);
    t3.standardInit();
    destruction = new StandardDeckModel("Destruction Deck", "destruction", json.Destruction.BaseCards);
    destruction.standardInit();
    
    allDecks = [o1,o2,o3,t1,t2,t3, destruction];
}

function initializeHands() {
    player1Hand = new HandModel("Player 1 Hand", "player1Hand" );
    player2Hand = new HandModel("Player 2 Hand", "player2Hand" );
    thingHand = new HandModel("The Thing Hand", "thingHand" );
    
    allHands = [player1Hand, player2Hand, thingHand];
}

function initializeCrewCards(json) {
    crewCards = new DeckModel("Crew Cards", "crew-cards", json.CrewCards);
    crewCards.init();
    updateRecRoom();
    for(var i=0; i < crewCards.length(); i++) {
        $("#chooseCardBody").append("<button \n\
                                      style='margin:7px 15px 17px 0;' \n\
                                      type='button'\n\
                                      class='btn btn-success' \n\
                                      data-toggle='popover' \n\
                                      data-trigger='hover' \n\
                                      data-placement='top' \n\
                                      data-content='"+crewCards.get(i).desc+"'>"+
                                      crewCards.get(i).name+"</button>");
    }
    
}

function initializeTasks(json) {
    tasks = new DeckModel("Tasks", "tasks", json.TaskCards.BaseCards);
    tasks.init();
    for(var i=0; i < tasks.length(); i++) {
        $("#tasks").append("<button style='margin:7px 15px 17px 0;' \n\
                                    type='button' class='btn btn-info' \n\
                                    data-toggle='popover' \n\
                                    data-trigger='hover' \n\
                                    data-placement='top'\n\
                                    data-content='"+tasks.get(i).desc+"<b class=\"tokenArea\">hold</b>'>"+tasks.get(i).name+"</button>");
    }
    
    $('#tasks .btn').unbind('click').bind('click', function () {
        var oldContent = $(this).attr('data-content');
        console.log("oldContent: " + oldContent);
        var jQueriedNodes = $($.parseHTML(oldContent));
        
        var tokenAreaTest = jQueriedNodes.filter('.tokenArea');
        console.log("tokenAreaTest:" + tokenAreaTest[0].innerHTML);
        $('.tokenArea', jQueriedNodes).append('*');
        console.log('didIFind: ' + jQueriedNodes);
//        var html = jQueriedString.filter('.tokenArea');
//        html[0].innerHTML = html[0].innerHTML + '*';

//        oldcontent;
//        var newConetent
        //$(this).attr('data-content', "token test");
        //console.log("oldContent:" + html[0].innerHTML);
    });
}

function initializeBlairSaucer(json) {
    blairSaucer = new DeckModel("Blair Saucer", "blairSaucer", json.BlairSaucer);
    blairSaucer.init();
    $("#thingArea").append("<button style='margin:7px 15px 17px 0;' \n\
                                    id='blairSaucer' \n\
                                    type='button' \n\
                                    class='btn btn-danger' \n\
                                    data-toggle='popover'\n\
                                    data-trigger='hover' \n\
                                    data-placement='top' \n\
                                    data-content='"+blairSaucer.get(0).desc+"'>"+
                                    blairSaucer.get(0).name+"</button>");
    $("#chooseCardBody").append("<button \n\
                                  id='placeUnderBlairFromModal' \n\
                                  style='margin:7px 15px 17px 0;' \n\
                                  type='button'\n\
                                  class='btn btn-danger' \n\
                                  data-toggle='popover' \n\
                                  data-trigger='hover' \n\
                                  data-placement='top' \n\
                                  data-content='"+blairSaucer.get(0).desc+"'>"+
                                  blairSaucer.get(0).name+"</button>");
}

function initializeThousandMiles(json) {
    thousandMilesToCoast = new DeckModel("Thousand Miles To Coast", "thousandMilesToCoast", json.ThousandMilesToCoast);
    thousandMilesToCoast.init();
    $("#thingArea").append("<button style='margin:7px 15px 17px 0;' \n\
                                    type='button' \n\
                                    class='btn btn-danger' \n\
                                    data-toggle='popover' \n\
                                    data-trigger='hover' \n\
                                    data-placement='top' \n\
                                    data-content='"+thousandMilesToCoast.get(0).desc+"'>"+thousandMilesToCoast.get(0).name+"</button>");
}

function initializeEncounterDeck(json) {
    encounterDeck = new DeckModel("Encounter Deck", "encounterDeck", buildEncounterDeck(json.EncounterDeck.Act1, json.EncounterDeck.Act2, json.EncounterDeck.Act3));
    encounterDeck.nonShuffleInit();
    drawEncounterCard();
}

function createCounterListener() {
    
}

function loadFileAsJSONmodel(URL) {
    $.getJSON(URL) 
        .done(function( json ) {
            initializeStandardDecks(json);
            initializeHands();
            initializeCrewCards(json);
            initializeTasks(json);
            initializeBlairSaucer(json);
            initializeThousandMiles(json);
            initializeEncounterDeck(json);
            
            $('[data-toggle="popover"]').popover({html:true});
            createCounterListener();
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
}

function buildEncounterDeck( act1, act2, act3 ) {
    var totalDeck = [];
    
    shuffle(act3);
//    console.log("act3: " + act3);
    totalDeck = totalDeck.concat(act3);
    
    shuffle(act2);
    totalDeck = totalDeck.concat(act2);
    
    totalDeck = totalDeck.concat(act1.reverse());
//    for(var i = 0; i < act1.length; i++) {
//        console.log("pos " + i + ": " + act1[i].name);
//    }
    
    return totalDeck;
}

function dealStartingHands() {
    player1Hand.draw(o1, STARTING_HAND_SIZE);
    player2Hand.draw(o1, STARTING_HAND_SIZE);
    thingHand.draw(t1, STARTING_HAND_SIZE);
}

function updateRecRoom() {
    $("#recRoom").empty();
    for(var i=0; i < crewCards.length(); i++) {
        $("#recRoom").append(" \
            <button style='margin:7px 15px 17px 0;' \\n\
                    id='crew"+ crewCards.get(i).name+"' \
                    type='button' \
                    class='btn btn-success' \
                    data-toggle='popover' \
                    data-trigger='hover' \
                    data-placement='top' \
                    data-content='"+crewCards.get(i).desc+"'>"+
                    crewCards.get(i).name+
            "</button>");
    }
    

    
    $('[data-toggle="popover"]').popover({html:true});
}

//shuffles an array of cards through side effects
function shuffle(listOfCards) {
    for(var i = 0; i<listOfCards.length; i++) {
        var newPos = Math.floor(Math.random() * listOfCards.length);
        var temp = listOfCards[i];
        listOfCards[i] = listOfCards[newPos];
        listOfCards[newPos] = temp;
    }
}

function DeckModel( inName, HTMLelementID, cardList ) {
    this.name = inName;
    this.HTMLid = HTMLelementID;
    this.stack;
    this.discardPile = [];
    
    //data is a list of cards(parsed JSON cards)
    this.tieToCardList = function( data ) {
        var outputStack = new Array();
        
        for(var i = 0; i < data.length; i++) {
            var currListing = data[i];
            outputStack.push(new CardModel(i+1, currListing.name, currListing.desc, this));
        }
        
        //console.log("OPS: " + outputStack);
        return outputStack;
    };
    
    this.toString = function() {
        var string = this.name + ": ";
        for(var i = 0; i < this.stack.length; i++) {
            string = string + "|"; //this.stack[i].id
        }
        return string;
    };
    
    this.getDiscardPileString = function() {
        var string = "Discard: ";
        for(var i = 0; i < this.discardPile.length; i++) {
            string = string + "|"; //this.stack[i].id
        }
        return string;
    };
    
    this.shuffle = function() {
        shuffle(this.stack);
    };
    
    this.pop = function() {
        this.updateDisplay();
        return this.stack.pop();
    };
    
    this.length = function() {
        return this.stack.length;
    };
    
    this.get = function(index) {
        return this.stack[index];
    };
    
    //I put this in a function because this has to happen after object creation,
    // or else there will not be a cardList to tie to;
    this.init = function() {
        this.stack = this.tieToCardList(cardList);
        //console.log(this.name +"'s stack: " + this.stack);
        this.shuffle();
    };
    
    this.nonShuffleInit = function() {
        this.stack = this.tieToCardList(cardList);
    };
    
    this.updateDisplay = function() {
        //console.log("parent function");
    };
    
    //cardSearchTerm is either the id# of a card, a name of a card, or the card itself
    this.removeCard = function( cardSearchTerm ) {
        //console.log("search term: " + cardSearchTerm);
        var removedCard = '';
        var found = false;
        for(var i = 0; i < this.stack.length && found === false ; i++) {
            //console.log("searching against " + this.stack[i].id + " and " + this.stack[i].name);
            if(this.stack[i].id == cardSearchTerm || 
               this.stack[i].name === cardSearchTerm ||
               this.stack[i] === cardSearchTerm) {
                removedCard = this.stack[i];
                found = true;
                this.stack.splice(i,1);
            }
        }
        //console.log('checking removedCard: ' + removedCard);
        if(found === true) {
            //console.log("returning...");
            return removedCard;
        }
        else {
            alert("card not found");
        }
    };
    
    this.shuffleDiscardIntoDeck = function() {
        console.log("now we're doin it");
        shuffle(this.discardPile);
        this.stack = this.stack.concat(this.discardPile);
        this.discardPile = [];
        this.updateDisplay();
    };
}

StandardDeckModel.prototype = new DeckModel();
function StandardDeckModel(inName, HTMLelementID, cardList){
    DeckModel.apply(this, arguments);
    
    this.updateDisplay = function() {
        document.getElementById(this.HTMLid).innerHTML = this.toString();
        document.getElementById(this.HTMLid+"discard").innerHTML = this.getDiscardPileString();
    };
    
    this.updateShuffle = function() {
        this.shuffle();
        this.updateDisplay();
    };
    
    
    this.standardInit = function() {
        this.createDeckAreaWithData(this.createShuffleButtonListener);
    };
    
    //callback should always refer to createShuffleButtonListener
    this.createDeckAreaWithData = function( callback ) {
        this.stack = this.tieToCardList(cardList);
        
        $('#decks').append(" \
                <div class='row'> \
                    <div class='col-xs-5'> \
                        <div class='panel panel-default deck-panel'> \
                            <div class='panel-body'> \ \
                                <span id='" + HTMLelementID + "'>"+ this.toString() +"</span> \
                            </div> \
                        </div> \
                    </div> \
                    \
                    <div class='col-xs-2'> \
                        <button type='button' \n\
                                      style='margin:7px 7px 7px 10px;' \n\
                                      class='btn btn-default shuffle-btn'>\n\
                                      Shuffle Discard Into Draw Deck</button> \
                    </div> \
                    \
                    <div class='col-xs-5'> \
                        <div class='panel panel-default discard-panel'> \
                            <div class='panel-body'> \ \
                                <span id='" + HTMLelementID + "discard'>"+ this.getDiscardPileString() +"</span> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
                ");
        
        var rowDOM = $('#decks .row:last');
        //console.log('did I find the row?' +  rowDOM.html());
        rowDOM.data('deckObj', this);
        
        //console.log("testing data entry: " + rowDOM.data('deckObj'));
        
        this.updateShuffle();
        callback();
    };
    
    this.createShuffleButtonListener = function() {
        $('.shuffle-btn').unbind('click').click(function() {
            var deckDisplayDOM = $(this).parent().parent();
            console.log("searching on " + deckDisplayDOM.html());
            var deckObj = deckDisplayDOM.data('deckObj');
            console.log("deckObj found! " + deckObj);
            deckObj.shuffleDiscardIntoDeck();
        });
    };
}

function HandModel( PlayerName, HTMLelementID ) {
    var contents = new Array();
    var pName = PlayerName;
    this.HTMLid = HTMLelementID;
    
    
    this.drawOne = function( deck ) {
        var card = deck.pop();
        contents.push(card);
        this.appendCardText(card, this.createDiscardButtonListener);
    };
    
    //callback should always refer to createDiscardButtonListener
    this.appendCardText = function( card, callback ) {
        $('#' + this.HTMLid).append("<span>"+card.getDiscardButtonHTML() + card.getPlaceUnderButtonHTML() + card.toString() + "</span>");
        //this selector should refer to the span object we just created in the previous line
        var cardSpan = $('#' + this.HTMLid + ' span:last');
        //console.log('cardSpan: ' + cardSpan.html() + " tied to " + card.name);
        cardSpan.data("cardObject", card);
        
        callback();
    };
    
    this.createDiscardButtonListener = function() {
        $('.discard-btn').unbind('click').click(function() {
            //this should refer to the same object as cardSpan, but a new variable
            //must be added because the listener takes place in a separate 
            //environment?
            var cardSpanDOM = $(this).parent();
            //console.log("cardSpanDOM found: " + cardSpanDOM.html());
            var cardObject = cardSpanDOM.data('cardObject');
            //console.log('cardObject is ' + cardObject.name);
            cardObject.discard();
            cardSpanDOM.remove();
        });
    };
    
    this.drawSpecificCard = function( deck , cardNum ) {
        if(cardNum === "") {
            //console.log("empty draw!");
            this.drawOne(deck);
            return;
        }
        else {
            //console.log("deck: " + deck + ",cardNum:" + cardNum);
            var drawnCard = deck.removeCard(cardNum);
            contents.push( drawnCard );
            //console.log("appending: " + drawnCard.toString() + " to " + "$(#" + this.HTMLid + ")");
            this.appendCardText( drawnCard, this.createDiscardButtonListener );
        }
    };
    
    // Returns an array of cards from the top of 'deck' 
    this.draw = function( deck, numCards ) {
        for(var i = 0; i < numCards; i++) {
            this.drawOne(deck);
        }
    };
    
    this.toString = function() {
        var string = ""; // = "<b>" + pName + ": </b> <p>";
        for(var i = 0; i < contents.length; i++) {
            string = string + contents[i].name + 
                     " <i><small>"+contents[i].desc+
                     "("+contents[i].id+")</small></i><p>";
        }
        return string;
    };

    this.updateDisplay = function() {
        document.getElementById(this.HTMLid).innerHTML = this.toString();
    };
}

function CardModel(inID, inName, inDesc, inDeck ) {
    this.id = inID;
    this.name = inName;
    this.desc = inDesc;
    this.misc = '';
    this.deck = inDeck;
    //console.log('card ' + this.name + ' created in ' + this.deck.name);
    
    //divID should refer to the id of the div which contains the card text
    this.getPlaceUnderButtonHTML = function( ) {
        return "<button \n\
                 style='margin:3px 3px 3px 0;' \n\
                 type='button' \n\
                 class='btn btn-default' \n\
                 data-toggle='modal' \n\
                 data-target='#placeUnderModal'>Place Under Card</button>";
    };
    
    this.getDiscardButtonHTML = function() {
        return "<button \n\
                 style='margin:3px 3px 3px 0;' \n\
                 type='button' \n\
                 class='btn btn-default discard-btn'>Discard</button>";
    };
    
    this.discard = function() {
        //console.log('removing card ' + this.name + '...');
        //console.log('pushing onto ' + this.deck.name + ' discard pile...');
        this.deck.discardPile.push(this);
        this.deck.updateDisplay();
    };
    
    this.toString = function() {
        return "<div class='cardTextContainer'><strong class='cardText'>" + this.name + "</strong><i><small>"+this.desc+ "(" + this.id + ")</small></i><p><div>";
    };
    

}
