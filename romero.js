var rom = undefined;

importScripts('boke.js');
importScripts('prueba.js');

function romero(){
	//vars

	//ajax vars
	var
		$ = undefined,
		ajaxUrl = undefined,
		ajaxDataType = "json";

	//client vars
	var
		clientId = 0;

	//state vars
	var
		started = false,
		finished = false,

		newData = false,
		resData = undefined,

		newAlg = false,
		alg = undefined,

		loop = undefined,
		prob = undefined;


	$ = new boke();


	///public functions///

	this.setUrl = function(value){

		if(typeof value == "undefined" || typeof value != "string"){
			throw new Error("Url is not correctly defined.");
		}
		else{
			ajaxUrl = value;
		}

		return this;
	}


	this.start = function(){
		//Check if the needed vars are correctly set.
		this._check();

		var auxData = {
			Id: 0,
			Code: 10			
		};

		$.ajax({
			async: false,
			url: ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_start
		});

		//First request to get the algorithm
		this.request();

		if(newAlg){
			newAlg = false;
			eval(alg);
			prob = new problem(this);
			loop = setInterval(function(){
				prob.mainFunc(resData);
			}, 100);
		}
		else{
			throw new Error("No algorithm received");
		}


	}

	this.request = function(data){

		//throw error if "start" was not called.
		if(!started){
			throw new Error("Romero is not started.")
		}

		var code = 20;

		if(typeof data != "undefined"){
			code = 30;
		}

		var auxData = {
			Id: clientId,
			Code: code,
			Data: data
		};

		$.ajax({
			async: false,
			url: ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_request
		});

	}


	this.asyncRequest = function(data){

		//throw error if "start" was not called.
		if(!started){
			throw new Error("Romero is not started.")
		}		

		var code = 20;

		if(typeof data != "undefined"){
			code = 30;
		}

		var auxData = {
			Id: clientId,
			Code: code,
			Data: data
		};

		$.ajax({
			async: true,
			url: ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_request
		});

	}

	this.newData = function(){
		if(newData){
			newData = false;
			return resData;
		}
		else{
			return undefined;
		}
	}

	this.newAlg = function(){
		return newAlg;
	}

	this.finish = function(){
		//throw error if "start" was not called.
		if(!started){
			throw new Error("Romero is not started.")
		}

		var auxData = {
			Id: clientId,
			Code: 100,
		};

		$.ajax({
			async: false,
			url: ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: function(){
				started = false;
				finished = true;
			}
		});

		clearInterval(loop);
	}


	///private functions///

	//check if the properties are set correctly
	this._check = function(){
		
		if(typeof ajaxUrl == "undefined" || typeof ajaxUrl != "string"){
			throw new Error("Url is not correctly defined.");
		}

	};

	this._success_start = function(res){

		self.postMessage({'cmd':'log','message':"Romero.Start -> ID: " + 
			res.Id +" Code: " + res.Code + " Data: " + res.Data});

		switch(res.Code){
			case 110:
				started = true;
				finished = false;
				clientId = res.Id;
				break;

			default:
				throw new Error("Incorrect response code: " + res.Code);

		}

	};

	this._success_request = function(res){

		self.postMessage({'cmd':'log','message':"Romero.Request -> ID: " + 
			res.Id + " Code: " + res.Code +	" Data: " + res.Data});

		switch(res.Code){

			case 120:
				newData = true;
				resData = res.Data;
				self.postMessage({'cmd':'log','message':"Romero -> new Data received."});
				break;

			case 130:
				newAlg = true;
				alg = res.Alg;
				newData = true;
				resData = res.Data;
				self.postMessage({'cmd':'log','message':"Romero -> new Algorithm received."});
				break;

			case 140:
				self.postMessage({'cmd':'log','message':"Romero -> Result received by the server."});			
				break;
			case 150:
				finished = true;
				self.postMessage({'cmd':'log','message':"Romero -> Connection finished by server."});
				break;
			
			default:
				throw new Error("Incorrect response code: " + res.Code);

		}

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