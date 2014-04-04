

function romero(){
	//vars

	//ajax vars
	var
		ajaxObject = undefined,
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
		alg = undefined;




	//Check and set the ajax library
	if(typeof jQuery != "undefined"){
		ajaxObject = $;
	}
	else{
		throw new Error("Romero.js needs a ajax library(jQuery not found).");
	}


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

		ajaxObject.ajax({
			async: false,
			url: ajaxUrl,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(auxData),
			success: this._success_start
		});

		var firstReq = this.request();

		while(!finished){

			if(newAlg){
				newAlg = false;
				eval(alg);
				mainFunc(this, resData);
				console.log("Pasó");
			}
			else{
				throw new Error("mainFunc terminated but 'finished' is not True");
			}
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



		ajaxObject.ajax({
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
			Data: data,
		};

		ajaxObject.ajax({
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

		ajaxObject.ajax({
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
	}


	///private functions///

	//check if the properties are set correctly
	this._check = function(){
		
		if(typeof ajaxUrl == "undefined" || typeof ajaxUrl != "string"){
			throw new Error("Url is not correctly defined.");
		}

	};

	this._success_start = function(res){

		console.log("Romero.Start -> ID: " + res.Id +" Code: " + res.Code +
			" Data: " + res.Data);

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

		console.log("Romero.Request -> ID: " + res.Id + " Code: " + res.Code +
			" Data: " + res.Data);

		switch(res.Code){

			case 120:
				newData = true;
				resData = res.Data;
				console.log("Romero -> new Data received.");
				break;

			case 130:
				newAlg = true;
				alg = res.Alg;
				newData = true;
				resData = res.Data;
				console.log("Romero -> new Algorithm received.");
				break;

			case 140:
				console.log("Romero -> Result received by the server.");			

			case 150:
				finished = true;
				console.log("Romero -> Connection finished by server.");
				break;
			
			default:
				throw new Error("Incorrect response code: " + res.Code);

		}

	};


	return this;
}