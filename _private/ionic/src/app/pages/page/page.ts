import { Component }																	from '@angular/core';
import { Router, ActivatedRoute } 														from '@angular/router';
import { DomSanitizer }                 												from '@angular/platform-browser';
import { NavParams, NavController, LoadingController, MenuController, Platform}			from '@ionic/angular';
import { AlertController, ActionSheetController, ModalController }						from '@ionic/angular';
import { AnimationController, PopoverController, ToastController }						from '@ionic/angular';
import { C8oPage, C8oPageBase, C8oRouter, C8oCafUtils }                      			from 'c8ocaf';
import { C8oNetworkStatus }                                 							from 'c8osdkangular';
import { ChangeDetectorRef, ChangeDetectionStrategy, InjectionToken, Injector, Type}	from "@angular/core";
import { TranslateService }                                 							from '@ngx-translate/core';
import { ActionBeans } 																	from '../../services/actionbeans.service';
import { Events } 																		from '../../services/events.service';

/*
	You can customize your page class by writing code between the :
   		Begin_c8o_XXXX and
   		End_c8o_XXXX
   	Comments.
   	Any code placed outside these these comments will be lost when the application is generated
*/


/*Begin_c8o_PageImport*/
/*End_c8o_PageImport*/

@Component({standalone: false, selector: 'page-page', templateUrl: 'page.html', styleUrls: ['page.scss'], changeDetection: ChangeDetectionStrategy.Default})
export class Page  extends C8oPage {
	

	public navParams : NavParams;
	public events : Events;
	public subscriptions = {};
	public actionBeans: ActionBeans;
	public JSON: JSON = window.JSON;
	public static nameStatic: string = "Page";
	/*Begin_c8o_PageDeclaration*/
	/*End_c8o_PageDeclaration*/

	constructor(routerProvider: C8oRouter, private route: ActivatedRoute, private angularRouter: Router, loadingCtrl: LoadingController, sanitizer: DomSanitizer, ref: ChangeDetectorRef, injector: Injector, menuCtrl: MenuController, public translate: TranslateService){
		super(routerProvider, loadingCtrl, sanitizer, ref, injector, menuCtrl);
		this.events = this.getInstance(Events);
		this.actionBeans = this.getInstance(ActionBeans);

        let updateNavParams = function(route: ActivatedRoute) {
			let params = {}
			Object.assign(params, route.snapshot.params)
			Object.assign(params, route.snapshot.queryParams)
			return new NavParams(params)
		}

		try {
			// for PopoverController, ModalController
			let params = this.getInstance(NavParams).data
			this.navParams = new NavParams(params)
		} catch (e) {
			// for NavController (based on angular router)
			this.navParams = updateNavParams(this.route)
			this.route.queryParams.subscribe(queryParameters => {
				this.navParams = updateNavParams(this.route)
			})
		}
				
		
		this.startMenuId = 'Menu';
		
		
		/*Begin_c8o_PageConstructor*/
		/*End_c8o_PageConstructor*/
		
    }
	
	instance() {
		return this;
	}
	
	public merge(firstObj: Object, secondObj): Object{
	    return Object.assign(firstObj, secondObj);
	}
	
	public log(val) {
	    console.log(val);
	}
	
	public navigate(url: string, data: any) {
	    this.angularRouter.navigate([url], { queryParams: data });
	}
	
	public navigateByUrl(url: string){
	    this.angularRouter.navigateByUrl(url);
	}
	
	/*Begin_c8o_PageFunction*/
	/*End_c8o_PageFunction*/
	
	
	ionViewWillLoad() {
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewDidLoad() {
		this.ref.detectChanges();
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewWillEnter() {
		super.ionViewWillEnter();
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewDidEnter() {
		super.ionViewDidEnter();
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewWillLeave() {
		super.ionViewWillLeave();
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewDidLeave() {
		super.ionViewDidLeave();
		try {
		} catch(e) {
			console.log(e)
		}
	}


	ionViewWillUnload() {
		try {
		} catch(e) {
			console.log(e)
		}
	}

	ngOnInit() {
	}
	
	ngAfterViewInit() {
	}
	
	ngOnDestroy() {
		this.subscriptions = {};
		super.ngOnDestroy();
	}
	
	

	/**
	 * Function ETS1673884366694
	 *   
	 * 
	 * @param stack , the object which holds actions stack
	 */
	ETS1673884366694(stack): Promise<any> {
		let c8oPage : C8oPageBase = this;
		let page : C8oPageBase = this;
		let parent;
		let scope;
		let out;
		let event;
		
		let fromScope = (keyVal: string) => {
			let scopeVal = keyVal
			if (scopeVal !== '' && scopeVal != undefined) {
				scopeVal = scopeVal.split('scope.').join('')
				for (let key in stack["root"].scope) {
					scopeVal = scopeVal.split(key).join('scope.'+key)
				}
			}
			return scopeVal;
		}
		
		let get = (keyName, keyVal, keyFunction?) => {
			keyFunction = keyFunction == undefined ? "onClick[ETS1673884366694]": keyFunction;
			let val = undefined;
			try {
				val= keyVal === '' ? keyVal : eval('('+ keyVal + ')');
				if (val == undefined) {
					c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value=undefined");
				} else {
					c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value="+ val);
				}
			} catch(e) {
				try {
					let scopeVal = fromScope(keyVal);
					val= keyVal === '' ? keyVal : eval('('+ scopeVal + ')');
					if (val == undefined) {
						c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value=undefined");
					} else {
						c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value="+ val);
					}
				} catch(e1) {
					
				}
				if (val == undefined) {
					let sKeyVal = keyVal == null ? "null" : (keyVal == undefined ? "undefined" : keyVal);
					c8oPage.c8o.log.warn("[MB] "+keyFunction+": For "+ keyName +":"+ sKeyVal + ", "+ e.message);
				}
			}
			return val;
		}
		
		parent = stack["root"];
		event = stack["root"].out;
		scope = stack["root"].scope;
		out = event;
		
		this.c8o.log.debug("[MB] onClick[ETS1673884366694]: started");
		return new Promise((resolveP, rejectP)=>{
		Promise.resolve(true)
		.catch((error:any) => {this.c8o.log.debug("[MB] onClick[ETS1673884366694]: An error occured : ",error.message); resolveP(false);})
		.then((res:any) => {this.c8o.log.debug("[MB] onClick[ETS1673884366694]: ended"); resolveP(res)});
		}).finally(() => {
			if (scope.refThrottle) {scope.refThrottle.unlock();}
		});
	}

	/**
	 * Function ETS1674728978975
	 *   
	 * 
	 * @param stack , the object which holds actions stack
	 */
	ETS1674728978975(stack): Promise<any> {
		let c8oPage : C8oPageBase = this;
		let page : C8oPageBase = this;
		let parent;
		let scope;
		let out;
		let event;
		
		let fromScope = (keyVal: string) => {
			let scopeVal = keyVal
			if (scopeVal !== '' && scopeVal != undefined) {
				scopeVal = scopeVal.split('scope.').join('')
				for (let key in stack["root"].scope) {
					scopeVal = scopeVal.split(key).join('scope.'+key)
				}
			}
			return scopeVal;
		}
		
		let get = (keyName, keyVal, keyFunction?) => {
			keyFunction = keyFunction == undefined ? "onClick[ETS1674728978975]": keyFunction;
			let val = undefined;
			try {
				val= keyVal === '' ? keyVal : eval('('+ keyVal + ')');
				if (val == undefined) {
					c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value=undefined");
				} else {
					c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value="+ val);
				}
			} catch(e) {
				try {
					let scopeVal = fromScope(keyVal);
					val= keyVal === '' ? keyVal : eval('('+ scopeVal + ')');
					if (val == undefined) {
						c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value=undefined");
					} else {
						c8oPage.c8o.log.trace("[MB] "+keyFunction+": key="+ keyName +" value="+ val);
					}
				} catch(e1) {
					
				}
				if (val == undefined) {
					let sKeyVal = keyVal == null ? "null" : (keyVal == undefined ? "undefined" : keyVal);
					c8oPage.c8o.log.warn("[MB] "+keyFunction+": For "+ keyName +":"+ sKeyVal + ", "+ e.message);
				}
			}
			return val;
		}
		
		parent = stack["root"];
		event = stack["root"].out;
		scope = stack["root"].scope;
		out = event;
		
		this.c8o.log.debug("[MB] onClick[ETS1674728978975]: started");
		return new Promise((resolveP, rejectP)=>{
		Promise.resolve(true)
		.catch((error:any) => {this.c8o.log.debug("[MB] onClick[ETS1674728978975]: An error occured : ",error.message); resolveP(false);})
		.then((res:any) => {this.c8o.log.debug("[MB] onClick[ETS1674728978975]: ended"); resolveP(res)});
		}).finally(() => {
			if (scope.refThrottle) {scope.refThrottle.unlock();}
		});
	}
}
