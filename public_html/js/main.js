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
            //console.log("getting deck from name: " + deckString);
            var deckObj = getDeckFromName(deckString);
            //console.log("handTarget: " + handTarget);
            var handObj = getHandFromHTMLid(handTarget);
            //console.log("deckObj: " + deckObj);
            handObj.drawSpecificCard(deckObj, cardID);
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
        $('#chooseCharacterBody .btn').unbind('click').bind('click', function () {
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
        $('#chooseCardBody .btn').unbind('click').bind('click', function () {
            theModal.modal('hide');
            var pickedCardHTMLelement = $('#crew' + $(this).html());
            pickedCardHTMLelement.removeClass('btn-success').addClass('btn-warning');
            var crewCardObj  = getCrewCardFromName($(this).html());
            crewCardObj.misc = crewCardObj.misc + "<br /><small>===" + invokingButton.attr('data-linkedCardName') + "===</small>";
            var oldContent = pickedCardHTMLelement.attr('data-content');
            pickedCardHTMLelement.attr('data-content', oldContent + crewCardObj.misc);
            invokingButton.parent().remove();
        });
    });
    
    $('#chooseCharModal').on('hidden.bs.modal', function () {
        $("#chooseCharacterBody").empty();
    });
    
    $('#dealStartingHandsButton').click(function () {
        dealStartingHands();
        $(this).prop('disabled', true);
    });
    
    loadFileAsJSONmodel("/DeckSim/decks.json");
});

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

function loadFileAsJSONmodel(URL) {
    $.getJSON(URL) 
        .done(function( json ) {
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
            
            player1Hand = new HandModel("Player 1 Hand", "player1Hand" );
            console.log("player1Hand: " + player1Hand.HTMLid);
            player2Hand = new HandModel("Player 2 Hand", "player2Hand" );
            console.log("player2Hand: " + player2Hand.HTMLid);
            thingHand = new HandModel("The Thing Hand", "thingHand" );
            console.log("thingHand: " + thingHand.HTMLid);
            
            allHands = [player1Hand, player2Hand, thingHand];
            
            crewCards = new DeckModel("Crew Cards", "crew-cards", json.CrewCards);
            crewCards.init();
            updateRecRoom();
            
            console.log("crewCards.length: " + crewCards.length());
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
            
            tasks = new DeckModel("Tasks", "tasks", json.TaskCards.BaseCards);
            tasks.init();
            for(var i=0; i < tasks.length(); i++) {
                $("#tasks").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-info' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+tasks.get(i).desc+"'>"+tasks.get(i).name+"</button>");
            }
            
            blairSaucer = new DeckModel("Blair Saucer", "blairSaucer", json.BlairSaucer);
            blairSaucer.init();
            $("#thingArea").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-danger' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+blairSaucer.get(0).desc+"'>"+blairSaucer.get(0).name+"</button>");
            
            thousandMilesToCoast = new DeckModel("Thousand Miles To Coast", "thousandMilesToCoast", json.ThousandMilesToCoast);
            thousandMilesToCoast.init();
            $("#thingArea").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-danger' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+thousandMilesToCoast.get(0).desc+"'>"+thousandMilesToCoast.get(0).name+"</button>");
            
            $('[data-toggle="popover"]').popover({html:true});
        })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
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

function DeckModel( inName, HTMLelementID, cardList ) {
    this.name = inName;
    this.HTMLid = HTMLelementID;
    this.stack;
    
    this.tieToCardList = function( data ) {
        var outputStack = new Array();
        
        for(var i = 0; i < data.length; i++) {
            var currListing = data[i];
            outputStack.push(new CardModel(i+1, currListing.name, currListing.desc));
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
    
    this.shuffle = function() {
        //Generates a random int between 0 and size-1
        for(var i = 0; i<this.stack.length; i++) {
            var newPos = Math.floor(Math.random() * (this.stack.length));
            var temp = this.stack[i];
            this.stack[i] = this.stack[newPos];
            this.stack[newPos] = temp;
        }
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
    
    this.updateDisplay = function() {
        console.log("parent function");
    };
    
    
    this.removeCard = function( cardSearchTerm ) {
        //console.log("search term: " + cardSearchTerm);
        var removedCard = '';
        var found = false;
        for(var i = 0; i < this.stack.length && found === false ; i++) {
            //console.log("searching against " + this.stack[i].id + " and " + this.stack[i].name);
            if(this.stack[i].id == cardSearchTerm || 
               this.stack[i].name === cardSearchTerm ) {
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
}

StandardDeckModel.prototype = new DeckModel();
function StandardDeckModel(inName, HTMLelementID, cardList){
    DeckModel.apply(this, arguments);
    
    this.updateDisplay = function() {
        document.getElementById(this.HTMLid).innerHTML = this.toString();
    };
    
    this.updateShuffle = function() {
        this.shuffle();
        this.updateDisplay();
    };
    
    this.standardInit = function() {
        this.stack = this.tieToCardList(cardList);
        
        $('#decks').append(" \
        <div class= 'panel panel-default'> \
            <div class='panel-body'> \ \
                <span id = '" + HTMLelementID + "'>"+ this.toString() +"</span> \
            </div> \
        </div> \
        ");
        
        this.updateShuffle();
    };
}

function HandModel( PlayerName, HTMLelementID ) {
    var contents = new Array();
    var pName = PlayerName;
    this.HTMLid = HTMLelementID;
    
    
    this.drawOne = function( deck ) {
        var card = deck.pop();
        contents.push(card);
        this.appendCardText(card);
    };
    
    this.appendCardText = function( card ) {
        $('#' + this.HTMLid).append("<span>"+card.getPlaceUnderButtonHTML() + card.toString() + "</span>");
    };
    
    this.drawSpecificCard = function( deck , cardNum ) {
        if(cardNum === "") {
            console.log("empty draw!");
            this.drawOne(deck);
            return;
        }
        else {
            //console.log("deck: " + deck + ",cardNum:" + cardNum);
            var drawnCard = deck.removeCard(cardNum);
            contents.push( drawnCard );
            //console.log("appending: " + drawnCard.toString() + " to " + "$(#" + this.HTMLid + ")");
            this.appendCardText( drawnCard );
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

function CardModel(inID, inName, inDesc ) {
    this.id = inID;
    this.name = inName;
    this.desc = inDesc;
    this.misc = '';
    
    //divID should refer to the id of the div which contains the card text
    this.getPlaceUnderButtonHTML = function( ) {
        return "<button \n\
                 style='margin:3px 3px 3px 0;' \n\
                 type='button' \n\
                 class='btn btn-default' \n\
                 data-toggle='modal' \n\
                 data-target='#placeUnderModal'\n\
                 data-linkedCardName='"+this.name+"'>Place Under Card</button>";
    };
    
    this.toString = function() {
        return "<strong>" + this.name + "</strong><i><small>"+this.desc+ "(" + this.id + ")</small></i><p>";
    };
}


