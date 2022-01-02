/**
 * StAuth10222: I Van Hoang Nguyen, 000763153 certify that this material is my original work. 
 * No other person's work has been used without due acknowledgement. 
 * I have not made my work available to anyone else.
 */
const { time } = require('console');
const { maxHeaderSize } = require('http');
const { start } = require('repl');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bidded_list;
var highest_bid;
var total_bid;
var name_highest_bidder;

// Return the auctioneer's page
app.get('/auctioneer', function (req, res) {
  res.sendFile(__dirname + '/auctioneer.html');
});

// Return the bidder's page
app.get('/bidder', function (req, res) {
  res.sendFile(__dirname + '/bidder.html');
});




io.on('connection', function (socket) {
  bidder_names = [];
  // receive start data from auctioneer then send to bidder
  socket.on("auction_start", function (data) {

    start_status = data.start;;

    // console.log("start: "+ start_status);
    socket.broadcast.emit("start_status", data);

    bidded_list = [{ "bidder_name": "auctioneer", "bid": data.price }];
    
    if(bidder_names.length==0)bidder_names.push("auctioneer");

    highest_bid = data.price;
    total_bid = 0;
    socket.emit("bidded_list", { "bidded_list": bidded_list, "bidder_names": bidder_names })



  });


  // Send data to client : time limit...  
  socket.on("auction_data", function (data) {

    time_limit = data.time_limit;

    // console.log("time: " + JSON.stringify(data));
    socket.broadcast.emit("server_auditon_data", {
      time_limit: data.time_limit,
      name: data.name,
      price: data.price,
      // highest_bid:highest_bid,
      // highest_bidder_name:name_highest_bidder,
      // total_bid:total_bid 

    });




  });


  socket.on("bidder_name", function (data) {

    bid_name = data.name;
    bidder_names.push(bid_name);


  });

  socket.on("bid", function (data) {
    socket.emit("highest_bid",
      {
        highest_bid: highest_bid,


      });
    if (data.bid > highest_bid) highest_bid = data.bid;
    total_bid += data.bid;
    name_highest_bidder = data.bidder_name;

    bidded_list.push(data);

    io.emit("bidded_list", { "bidded_list": bidded_list, "bidder_names": bidder_names });



  });



});

// Start the server
http.listen(3000, function () {
  console.log('listening on *:3000');
});
