/*jsyaml is a global variable defined in js-yaml.min.js*/
var STARTING_HAND_SIZE = 6;
var o1,o2,o3,t1,t2,t3; //deck handles

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
}); 

$("#decks :button").click(function() {
    alert("whoo!");
});

function loadFileAsJSONmodel(URL) {
$.getJSON(URL) 
    .done(function( json ) {
        o1 = new Deck("Outpost 31-Deck #1", "OutpostDeck1", json.OutpostDeck1.BaseCards);
        o2 = new Deck("Outpost 31-Deck #2", "OutpostDeck2", json.OutpostDeck2.BaseCards);
        o3 = new Deck("Outpost 31-Deck #3", "OutpostDeck3", json.OutpostDeck3.BaseCards);
        t1 = new Deck("The Thing-Deck #1", "ThingDeck1", json.ThingDeck1.BaseCards);
        t2 = new Deck("The Thing-Deck #2", "ThingDeck2", json.ThingDeck2.BaseCards);
        t3 = new Deck("The Thing-Deck #3", "ThingDeck3", json.ThingDeck3.BaseCards);
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

function Deck( inName, HTMLelementID, cardList ) {
    var name = inName;
    this.HTMLid = HTMLelementID;

    this.tieToCardList = function( data ) {
        var outputStack = new Array();

        for(var i = 0; i < data.length; i++) {
            var currListing = data[i];
            outputStack.push(new Card(i+1, currListing.name, currListing.desc));
        }

        return outputStack;
    };

    this.toString = function() {
        var string = name + ": ";
        for(var i = 0; i < stack.length; i++) {
            string = string + stack[i].id + " ";
        }
        return string;
    };

    this.shuffle = function() {
        //Generates a random int between 0 and size-1
        for(var i = 0; i<stack.length; i++) {
            var newPos = Math.floor(Math.random() * (stack.length));
            var temp = stack[i];
            stack[i] = stack[newPos];
            stack[newPos] = temp;
        }
        this.updateDisplay();
    };

    this.pop = function() {
        this.updateDisplay();
        return stack.pop();
    };

    this.updateDisplay = function() {
        document.getElementById(this.HTMLid).innerHTML = this.toString();
    };

    var stack = this.tieToCardList(cardList);
    this.shuffle();
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

    /*
     * Returns an array of cards from the top of 'deck' 
     */
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

    this.draw(deck, startingHandSize);
}

function Card(inID, inName, inDesc ) {
    this.id = inID;
    this.name = inName;
    this.desc = inDesc;
}
