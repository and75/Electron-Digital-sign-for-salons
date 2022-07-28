AppSalon = (function () {

    //FUNCTION EXAMPLE POUR AJOUTER DE METHODES PUBLIQUES
	AppSalon.LabExt = {
		
		that : AppSalon,
		params :{

		},
		
		test : function(){

	        //examples pour utiliser le config globale de la class AppSalon
			var config = this.that.config;
			
	        //Example of use public AppSalon function
	        //Important!!!!! Use this function for print the console.log!!!!!
			this.that.PrintDebug('AppSalon.LabExt is ready');
			
			//Your Js Code
	        //alert('SalleFunctionTest It Works!!');
	
		},
		
		init : function(options){
			
	        $.extend(true, this.params, options);
	        this.test();
	        
		}

    };

	return AppSalon;

})(AppSalon || {});