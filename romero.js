var rom = undefined;
var $ = undefined;

importScripts('https://330739ac0ba302a2d4ed866245f29314cd40c14b.googledrive.com/host/0B5SaLGQ5dQipR2pxYktLMm93bzQ/');

function romero(){
	//vars

	//ajax vars
	this.ajaxUrl = undefined;

	//client vars
	this.clientId = 0;
	this.clientKey = 0;
	this.clientStatus = 0;

	//state vars	
	this.started = false;
	this.finished = false;

	this.newData = false;
	this.resData = undefined;

	this.newAlg = false;
	this.alg = undefined;

	this.loop = undefined;
	this.prob = undefined;


	$ = new boke();

	///public functions///

	this.setUrl = function(value){

		if(typeof value == "undefined" || typeof value != "string"){
			throw new Error("Url is not correctly defined.");
		}
		else{
			this.ajaxUrl = value;
		}

		return this;
	};


	this.start = function(){
		//Check if the needed vars are correctly set.
		this._check();

		var auxData = {
			Id: 0,
			Key: 0,
			LastUpdate: 0,
			Code: 10			
		};

		$.ajax({
			async: false,
			url: this.ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_start(this)
		});

		//First request to get the algorithm
		this.request();
		if(this.newAlg){
			this.newAlg = false;
			eval(this.alg);
			this.prob = new problem(this);
			var auxRom = this;
			this.loop = setInterval(function(){
				auxRom.prob.mainFunc(auxRom.resData);
			}, 10);
		}
		else{
			throw new Error("No algorithm received");
		}


	};

	this.request = function(data){

		//throw error if "start" was not called.
		if(!this.started){
			throw new Error("Romero is not started.")
		}

		var code = 20;

		if(typeof data != "undefined"){
			code = 30;
		}


		var auxData = {
			Id: this.clientId,
			Key: this.clientKey,
			LastUpdate: this.clientStatus,
			Code: code,
			Data: data,
			
		};

		$.ajax({
			async: false,
			url: this.ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_request(this)
		});

	};


	this.asyncRequest = function(data){

		//throw error if "start" was not called.
		if(!this.started){
			throw new Error("Romero is not started.")
		}		

		var code = 20;

		if(typeof data != "undefined"){
			code = 30;
		}

		var auxData = {
			Id: this.clientId,
			Key: this.clientKey,			
			Code: code,
			Data: data,
			LastUpdate: this.clientStatus
		};

		$.ajax({
			async: true,
			url: this.ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_request(this)
		});

	};

	this.result = function(res){
		this.request(res);
	};

	this.asyncResult = function(res){
		this.ayncRequest(res);
	}

	this.newUpdate = function(){
		if(this.newData){
			this.newData = false;
			return this.resData;
		}
		else{
			return null;
		}
	};

	this.newAlg = function(){
		return this.newAlg;
	};

	this.finish = function(){
		//throw error if "start" was not called.
		if(!this.started){
			throw new Error("Romero is not started.")
		}

		var auxData = {
			Id: this.clientId,
			Key: this.clientKey,
			Code: 100,
		};

		var auxRom = this;

		$.ajax({
			async: false,
			url: this.ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_request(this)
		});

		clearInterval(this.loop);
	};


	///private functions///

	//check if the properties are set correctly
	this._check = function(){
		
		if(typeof this.ajaxUrl == "undefined" || typeof this.ajaxUrl != "string"){
			throw new Error("Url is not correctly defined.");
		}

	};

	this._success_start = function(rom){

		return function(res){

			self.postMessage({'cmd':'log','message':"Romero.Start -> ID: " + 
				res.Id + " Key: " + res.Key + " Code: " + res.Code + " Data: " + res.Data});

			switch(res.Code){
				case 110:
					rom.started = true;
					rom.finished = false;
					rom.clientId = res.Id;
					rom.clientKey = res.Key;
					rom.clientStatus = res.Status;
					break;

				default:
					throw new Error("Incorrect response code: " + res.Code);

			}
		};

	};

	this._success_request = function(rom){

		return function(res){
			self.postMessage({'cmd':'log','message':"Romero.Request -> ID: " + 
				res.Id + " Key: " + res.Key + " Code: " + res.Code + " Data: " + res.Data});

			switch(res.Code){

				case 120:
					rom.newData = true;
					rom.resData = res.Data;
					rom.clientStatus = res.Status;
					self.postMessage({'cmd':'log','message':"Romero -> new Data received."});
					break;

				case 130:
					rom.newAlg = true;
					rom.alg = res.Alg;
					rom.newData = true;
					rom.resData = res.Data;
					rom.clientStatus = res.Status;
					self.postMessage({'cmd':'log','message':"Romero -> new Algorithm received."});
					break;

				case 140:
					self.postMessage({'cmd':'log','message':"Romero -> Result received by the server."});			
					break;
				case 150:
					rom.finished = true;
					rom.started = false;
					self.postMessage({'cmd':'log','message':"Romero -> Connection finished by server."});
					break;
				
				default:
					throw new Error("Incorrect response code: " + res.Code);

			}
		};
	};


	return this;
}


rom = new romero();


self.addEventListener('message', function(e){
	var data = e.data;
	switch(data.cmd){
		case 'url':
		rom.setUrl(data.url);
		break;
		case 'start':
		rom.start();
		break;
		case 'stop':
		self.close();
		break;
	}
});