/*jsyaml is a global variable defined in js-yaml.min.js*/
var STARTING_HAND_SIZE = 6;
var o1,o2,o3,t1,t2,t3; //deck handles
var destruction;
var allDecks; 
var crewCards;
var tasks;
var blairSaucer;
var thousandMilesToCoast;
var player1Hand, player2Hand;

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
    loadFileAsJSONmodel("/DeckSim/decks.json");
    
    player1Hand = new Hand("Player 1 Hand");
    player2Hand = new Hand("Player 2 Hand");
});

$('#drawModal').on('show.bs.modal', function (event) {
    $("#deckButtons").empty();
    for(var i=0; i < allDecks.length; i++) {
        $("#deckButtons").append(" \
            <div class='radio'> \
              <label><input type='radio' name='optradio'>"+ allDecks[i].name + "</label> \
            </div> \
        ");
    }
});

$('#removeCardAcceptButton').click(function () {
    var cardID = document.getElementById("cardIDinput").value;
    console.log("removecard() " + cardID);
});

$('#chooseCharModal').on('show.bs.modal', function (e) {
    for(var i=0; i < crewCards.length(); i++) {
        $("#chooseCharacterBody").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-success' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+crewCards.get(i).desc+"'>"+crewCards.get(i).name+"</button>");
    }
    var theModal = $(this);
    var invokingButton = $(e.relatedTarget);
    var handTarget = '#' + invokingButton.attr('data-hand');
    $('#chooseCharacterBody .btn').click(function () {
        theModal.modal('hide');
        var removedCard = crewCards.removeCard($(this).html());
        $(handTarget).append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-success' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+removedCard.desc+"'>"+removedCard.name+"</button>");
        $('[data-toggle="popover"]').popover({html:true});
        updateRecRoom();
        invokingButton.prop('disabled', true);
    });
});

$('#chooseCharModal').on('hidden.bs.modal', function () {
    $("#chooseCharacterBody").empty();
});

$('#dealStartingHandsButton').click(function () {
    dealStartingHands();
    $(this).prop('disabled', true);
});

function loadFileAsJSONmodel(URL) {
    $.getJSON(URL) 
        .done(function( json ) {
            o1 = new StandardDeck("Outpost 31-Deck #1", "OutpostDeck1", json.OutpostDeck1.BaseCards);
            o1.standardInit();
            o2 = new StandardDeck("Outpost 31-Deck #2", "OutpostDeck2", json.OutpostDeck2.BaseCards);
            o2.standardInit();
            o3 = new StandardDeck("Outpost 31-Deck #3", "OutpostDeck3", json.OutpostDeck3.BaseCards);
            o3.standardInit();
            t1 = new StandardDeck("The Thing-Deck #1", "ThingDeck1", json.ThingDeck1.BaseCards);
            t1.standardInit();
            t2 = new StandardDeck("The Thing-Deck #2", "ThingDeck2", json.ThingDeck2.BaseCards);
            t2.standardInit();
            t3 = new StandardDeck("The Thing-Deck #3", "ThingDeck3", json.ThingDeck3.BaseCards);
            t3.standardInit();
            destruction = new StandardDeck("Destruction Deck", "destruction", json.Destruction);
            destruction.standardInit();
            
            allDecks = [o1,o2,o3,t1,t2,t3, destruction];
            
            crewCards = new Deck("Crew Cards", "crew-cards", json.CrewCards);
            crewCards.init();
            updateRecRoom();
            
            tasks = new Deck("Tasks", "tasks", json.TaskCards);
            tasks.init();
            for(var i=0; i < tasks.length(); i++) {
                $("#tasks").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-info' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+tasks.get(i).desc+"'>"+tasks.get(i).name+"</button>");
            }
            
            blairSaucer = new Deck("Blair Saucer", "blairSaucer", json.BlairSaucer);
            blairSaucer.init();
            $("#thingArea").append("<button style='margin:7px 15px 17px 0;' type='button' class='btn btn-danger' data-toggle='popover' data-trigger='hover' data-placement='top' data-content='"+blairSaucer.get(0).desc+"'>"+blairSaucer.get(0).name+"</button>");
            
            thousandMilesToCoast = new Deck("Thousand Miles To Coast", "thousandMilesToCoast", json.ThousandMilesToCoast);
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
    var player1 = new Hand("Player 1 Hand", o1, STARTING_HAND_SIZE, "p1hand" );
    var player2 = new Hand("Player 2 Hand", o1, STARTING_HAND_SIZE, "p2hand" );
    var thing = new Hand("The Thing Hand", t1, STARTING_HAND_SIZE, "thingHand" );
}

function updateRecRoom() {
    $("#recRoom").empty();
    for(var i=0; i < crewCards.length(); i++) {
        $("#recRoom").append(" \
            <button style='margin:7px 15px 17px 0;' \
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

function Deck( inName, HTMLelementID, cardList ) {
    this.name = inName;
    this.HTMLid = HTMLelementID;
    this.stack;
    
    this.tieToCardList = function( data ) {
        var outputStack = new Array();
        
        for(var i = 0; i < data.length; i++) {
            var currListing = data[i];
            outputStack.push(new Card(i+1, currListing.name, currListing.desc));
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
        console.log(this.name +"'s stack: " + this.stack);
        this.shuffle();
    };
    
    this.updateDisplay = function() {
        console.log("parent function");
    };
    
    this.removeCard = function( cardName ) {
        console.log("removing " + cardName);
        for(var i = 0; i < this.stack.length ; i++) {
            if(this.stack[i].name === cardName) {
                var removedCard = this.stack[i];
                this.stack.splice(i,1);
                return removedCard;
            }
        }
    };
}

StandardDeck.prototype = new Deck();
function StandardDeck(inName, HTMLelementID, cardList){
    Deck.apply(this, arguments);
    
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

function Hand( PlayerName, deck, startingHandSize, HTMLelementID ) {
    var contents = new Array();
    var pName = PlayerName;
    this.HTMLid = HTMLelementID;

    //Priveleged
    this.drawOne = function( deck ) {
        contents.push(deck.pop());
        this.updateDisplay();
        deck.updateDisplay();
    };
    
    this.drawSpecificCard = function( deck , cardName ) {
        contents.push(deck.removeCard(cardName));
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

    if(deck !== null) {
        this.draw(deck, startingHandSize);
    }
}

function Card(inID, inName, inDesc ) {
    this.id = inID;
    this.name = inName;
    this.desc = inDesc;
}
