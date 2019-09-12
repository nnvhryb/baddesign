import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from "react-router-dom"
import { Switch } from 'react-router'
import axios from 'axios';
import Cookies from 'universal-cookie';
import translations from '../../translations'

import NotFound from '../notFound';
import MainPage from '../mainPage';
import StartTrading from '../startTrading';
import Listing from '../listing';
import ListingForm from '../listingForm';
import Exchange from '../exchange';
import Login from '../login';
import Header from '../header';
import Footer from '../footer';
import DepositsAndWithdrawals from '../depositsAndWithdrawals';
import Fees from '../fees'
import BlogList from '../blogList'
import BlogNews from '../blogNews'
import Vote from '../vote'
import VoteItem from '../voteItem'
import History from '../history';
import CoinInfo from '../coinInfo';
import ConfirmEmail from '../confirm_email';
import BlogForm from '../blogNews/Form'
import apiLink from './environment';
import { RequestResetPassword, ResetPassword } from '../resetpass';
import Settings from '../settingUser';
import WacDaqAPI from '../../api';

const cookies = new Cookies();

class pagesRouter extends Component {

    constructor(props) {
        super(props);
        let lang = cookies.get('language') ? cookies.get('language') : 'EN';
        let langId = lang === 'EN' ? 1 : 2;

        const identity = {
            uid: cookies.get('user_id'),
            uauthkey: cookies.get('userAuthKey')
        };

        this.api = new WacDaqAPI(identity);

        this.state = {            
            loading: true,
            updating: false,
            ajaxCancelSource: false,
            authUserData: {},
            currentPair: {},
            pairs: {},
            balances: [],
            // orderBook: false,
            // orderBookLength: 0,
            // marketDepth: false,
            // marketDepthLength: 0,
            // tradeHistory: false,
            // myOrders: false,
            // userAuthKeyParam: false,
            // updatingUser: false,
            // currentPairParam: false,
            //updatingPair: false,
            buyPrice: '',
            buyAmount: 0.00000000,
            buyTotal: 0.00000000,
            buyError: null,
            sellPrice: '',
            sellAmount: 0.00000000,
            sellTotal: 0.00000000,
            sellError: null,
            // graphData: false,
            // graphDataLength: 0,
            // silentUpdate: false,
            // silentUpdateGraph: false,
            sellPriceDefaultSet: false,
            buyPriceDefaultSet: false,
            language: lang,
            languageId: langId,
            translations
        };

        //this.getExchangeData = this.getExchangeData.bind(this);
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.selectPair = this.selectPair.bind(this);
        this.handleBuyPriceChange = this.handleBuyPriceChange.bind(this);
        this.handleBuyAmountChange = this.handleBuyAmountChange.bind(this);
        this.handleBuyTotalChange = this.handleBuyTotalChange.bind(this);
        this.handleSellPriceChange = this.handleSellPriceChange.bind(this);
        this.handleSellAmountChange = this.handleSellAmountChange.bind(this);
        this.handleSellTotalChange = this.handleSellTotalChange.bind(this);
        // this.deleteOrder = this.deleteOrder.bind(this);
        this.handleSellFormSubmit = this.handleSellFormSubmit.bind(this);
        this.handleBuyFormSubmit = this.handleBuyFormSubmit.bind(this);
        this.getGraphData = this.getGraphData.bind(this);

        this.handleSellDefaultSet = this.handleSellDefaultSet.bind(this);
        this.handleBuyDefaultSet = this.handleBuyDefaultSet.bind(this);

        this.handleSellPriceAndAmountChange = this.handleSellPriceAndAmountChange.bind(this);
        this.handleBuyPriceAndAmountChange = this.handleBuyPriceAndAmountChange.bind(this);

        this.handleSellPriceAndTotalChange = this.handleSellPriceAndTotalChange.bind(this);
        this.handleBuyPriceAndTotalChange = this.handleBuyPriceAndTotalChange.bind(this);

        this.changeLanguage = this.changeLanguage.bind(this);
    }

    async componentDidMount() {
        try {
            await this.updateBalances();            
            const { data: authUserData } = await this.api.getAuthData();
            const { data: pairs } = await this.api.getPairs();
            
            this.setState({ authUserData, pairs }, () => {
                let currentPair = {};

                if (window.location.hash.length) {
                    const shortName = window.location.hash.slice(1);
                    currentPair = this.getPair(shortName);
                } else {
                    const firstPair = pairs[Object.keys(pairs)[0]];    

                    currentPair = { 
                        titleCurrency: firstPair.data,
                        listCurrency: firstPair.pairs[Object.keys(firstPair.pairs)[0]],
                    };

                    currentPair.pairId = currentPair.listCurrency.pairId;
                }

                this.setState({ 
                    currentPair,
                    updating: false,
                    loading: false
                });
            });
        } catch (ex) {
            console.warn(ex);
        }
    }

    componentDidUpdate() {
        if (this.state.buyError) {
            setTimeout(() => {
                this.setState({ buyError: null });
            }, 3000);
        }

        if (this.state.sellError) {
            setTimeout(() => {
                this.setState({ sellError: null });
            }, 3000);
        }
    }

    updateBalances = async () => {
        let balances = [];

        try {
            balances = (await this.api.getBalances()).data;
        } catch (ex) {
            console.warn(ex);
        }
        
        this.setState({ balances, updating: false }); 
    }

    handleSellDefaultSet(price) {
        this.setState({
            sellPriceDefaultSet: true
        }, () => {
            this.handleSellPriceChange(price, true);
        });
    }

    handleBuyDefaultSet(price) {
        this.setState({
            buyPriceDefaultSet: true
        }, () => {
            this.handleBuyPriceChange(price, true);
        });
    }

    // deleteOrder(order_id) {  
    //     let userAuthKey = cookies.get('userAuthKey');
    //     let params = {};

    // 	if (typeof(userAuthKey) != 'undefined' && userAuthKey)
    // 		params['access-token'] = userAuthKey;

    // 	axios({
    // 		method: 'PUT',
    // 		url: apiLink+'my-order/' + order_id,
    //         headers: { 'content-type': 'application/x-www-form-urlencoded' },
    // 		data: qs.stringify({ id_status: 3 }),
    //         params: params
    // 	})
    // 	.then((response) => {

    //         let updatedMyOrder = response.data;
    //         let myOrders = this.state.myOrders;

    //         for (let i = 0; i < Object.keys(myOrders).length; i++)
    //         {
    //             if (myOrders[Object.keys(myOrders)[i]].id == updatedMyOrder.id)
    //             {
    //                 myOrders[Object.keys(myOrders)[i]].id_status = updatedMyOrder.id_status;
    //             }
    //         }

    //         this.setState({myOrders});            
    // 	})
    // 	.catch(function (error) {

    // 	});	
    // }

    logout() {
        let params = {};

        // TODO: Нужно вынести в api.js
        axios({
            method: 'get',
            url: apiLink + 'logout',
            params
        }).then((response) => {
            this.setState({ authUserData: {
                authorized: false,
                id: undefined,
                auth_key: undefined,
                email: undefined,
                comission: {
                    id: 0,
                    name: 'default',
                    percentage: 0.2
                }
            }}, () => {
                cookies.remove('userAuthKey');
                cookies.remove('user_id');
                this.api.setIdentity({uid: undefined, uauthkey: undefined})
                this.updateBalances();
            })
        }).catch((response) => {

        });
    }

    login(authUserData) {
        if (authUserData.authorized) {
            this.api.setIdentity({uid: authUserData.id, uauthkey: authUserData.auth_key});
            this.setState({
                authUserData
            }, () => {
                this.updateBalances();
            });
        } else {
            this.logout();
            // this.getUserData();
        }
    }

    // getUserData() {
    //     let userAuthKey = cookies.get('userAuthKey');
    //     let params = {};

    //     if (typeof (userAuthKey) !== 'undefined' && userAuthKey)
    //         params['access-token'] = userAuthKey;

    //     axios({
    //         method: 'get',
    //         url: apiLink + 'api/authdata',
    //         params
    //     }).then((response) => {
    //         this.setState({
    //             authUserData: response.data
    //         })
    //     }).catch((response) => {

    //     });
    // }

    // getPair() {
    //     this.state.pairs.filter
    // }

    getPair(pairId) {
        let pairs = this.state.pairs;

        for (let key in pairs) {
            for (let pairKey in pairs[key].pairs) {
                if (
                    (
                        typeof pairId === "string" 
                        && `${pairs[key].data.short_name}_${pairs[key].pairs[pairKey].short_name}` === pairId
                    ) || (
                        typeof pairId === "number" 
                        && pairs[key].pairs[pairKey].pairId === pairId
                    )
                ) {
                    return {
                        pairId: pairs[key].pairs[pairKey].pairId,
                        titleCurrency: pairs[key].data,
                        listCurrency: pairs[key].pairs[pairKey],
                    };
                }
            }
        }
    }

    selectPair(pairId) {
        this.setState({ updating: true }, () => {
            const currentPair = this.getPair(pairId);

            if (currentPair) {
                window.location.hash = currentPair.titleCurrency.short_name + '_' + currentPair.listCurrency.short_name;

                this.setState({
                    updating: false,
                    currentPair,
                    buyPrice: '',
                    buyAmount: '',
                    buyTotal: '',
                    sellPrice: '',
                    sellAmount: '',
                    sellTotal: '',
                });
            }
        });        
    }

    // getExchangeData(silentUpdate) {
    //     if (typeof (silentUpdate) === 'undefined')
    //         silentUpdate = false;

    //     if (window.location.hash.length) {
    //         let pairs = this.state.pairs;
    //         Object.keys(pairs).forEach(function (i) {
    //             Object.keys(pairs[i].pairs).forEach(function (k) {
    //                 if (pairs[i].data.short_name + '_' + pairs[i].pairs[k].short_name === window.location.hash.replace('#', '')) {
    //                     cookies.set('currentPair', pairs[i].pairs[k].pairId, { path: '/' });
    //                     return;
    //                 }
    //             });
    //         });
    //     } else {
    //         let pairs = Object.values(this.state.pairs)[0].pairs;
    //         let pairId = Object.values(pairs)[0].pairId;
    //         cookies.set('currentPair', pairId, { path: '/' });
    //     }

    //     let userAuthKey = cookies.get('userAuthKey');
    //     let currentPair = cookies.get('currentPair');
    //     let params = {};
    //     if (typeof (userAuthKey) !== 'undefined' && userAuthKey)
    //         params['access-token'] = userAuthKey;

    //     if (typeof (currentPair) !== 'undefined' && currentPair)
    //         params['current-pair-id'] = currentPair;

    //     if (this.state.ajaxCancelSource)
    //         this.state.ajaxCancelSource.cancel('Operation canceled by the user.');

    //     // if (this.state.getExchangeTimeout)
    //     //     clearTimeout(this.state.getExchangeTimeout);

    //     if (!silentUpdate && this.state.graphUpdateAjaxCancelSource)
    //         this.state.graphUpdateAjaxCancelSource.cancel('Operation canceled by the user.');

    //     if (!silentUpdate && this.state.graphUpdateTimeout)
    //         clearTimeout(this.state.graphUpdateTimeout);

    //     let ajaxCancelSource = axios.CancelToken.source();

    //     this.setState({
    //         ajaxCancelSource,
    //         updating: true,
    //         silentUpdate,
    //         updatingUser: (userAuthKey !== this.state.userAuthKeyParam),
    //         userAuthKeyParam: userAuthKey,
    //         updatingPair: (currentPair !== this.state.currentPairParam),
    //         currentPairParam: currentPair
    //     }, () => {
    //         axios({
    //             method: 'get',
    //             url: apiLink + 'exchange-data',
    //             params: params,
    //             cancelToken: this.state.ajaxCancelSource.token
    //         })
    //             .then((response) => {
    //                 // let authUserData = false;
    //                 let currentPair = false;
    //                 let pairs = false;
    //                 let balance = false;
    //                 // let orderBook = false;
    //                 // let tradeHistory = false;
    //                 // let myOrders = false;
    //                 // let orderBookLength = 0;
    //                 // let marketDepth = false;
    //                 // let marketDepthLength = 0;

    //                 response.data.forEach((block) => {
    //                     switch (block.block) {
    //                         // case 'authUserData':
    //                         // 	authUserData = block.data;
    //                         // break;

    //                         case 'currentPair':
    //                             currentPair = block.data;
    //                             break;

    //                         case 'pairs':
    //                             pairs = block.data;
    //                             break;

    //                         case 'balance':
    //                             balance = block.data;
    //                             break;

    //                         // case 'orderBook':
    //                         // 	orderBook = block.data;                            
    //                         //     orderBookLength = Object.keys(orderBook).length;
    //                         // break;

    //                         // case 'marketDepth':
    //                         // 	marketDepth = block.data;                            
    //                         //     marketDepthLength = Object.keys(marketDepth).length;
    //                         // break;

    //                         // case 'tradeHistory':
    //                         // 	tradeHistory = block.data;
    //                         // break;

    //                         // case 'myOrders':
    //                         // 	myOrders = block.data;
    //                         // break;
    //                         default: break;
    //                     }
    //                 });

    //                 this.setState({
    //                     loaded: true,
    //                     // authUserData,
    //                     currentPair,
    //                     pairs,
    //                     balance,
    //                     // orderBook,
    //                     // orderBookLength,
    //                     // marketDepth,
    //                     // marketDepthLength,
    //                     // tradeHistory,
    //                     // myOrders,
    //                     updating: false,
    //                     updatingUser: false,
    //                     updatingPair: false,
    //                     silentUpdate
    //                 }, () => {
    //                     // let getExchangeTimeout = 
    //                     // setTimeout(function(){
    //                     //     this.getExchangeData(true);    
    //                     // }.bind(this), 1000);

    //                     // this.setState({
    //                     //     getExchangeTimeout: getExchangeTimeout
    //                     // });

    //                     if (!silentUpdate) {
    //                         this.getGraphData();
    //                     }
    //                 });

    //             })
    //             .catch(() => { });
    //     });
    // }

    getGraphData(silentUpdateGraph) {
        return false;

        // if (typeof(silentUpdateGraph) == 'undefined')
        //     silentUpdateGraph = false;

        // let params = {};

        // if (typeof(this.state.currentPair) != 'undefined' && this.state.currentPair)
        // 	params['current-pair-id'] = this.state.currentPair.pairId;

        // params['period'] = 60;

        // if (this.state.graphUpdateAjaxCancelSource)
        // 	this.state.graphUpdateAjaxCancelSource.cancel('Operation canceled by the user.');

        // if (this.state.graphUpdateTimeout)
        //     clearTimeout(this.state.graphUpdateTimeout);

        // let graphUpdateAjaxCancelSource = axios.CancelToken.source();

        // this.setState({
        // 	graphUpdateAjaxCancelSource,
        //     updatingGraph: true,
        //     silentUpdateGraph
        // }, () => {
        //     axios({
        // 		method: 'get',
        // 		url: apiLink+'price-by-period',
        // 		params: params,
        // 		cancelToken: this.state.graphUpdateAjaxCancelSource.token
        // 	})
        // 	.then((response) => {  
        // 	    let graphData = response.data;
        //         let graphDataLength = Object.keys(graphData).length;

        // 		this.setState({
        // 			updatingGraph: false,
        //             graphData,
        //             graphDataLength,
        //             silentUpdateGraph
        // 		}, () => {
        // 		    let graphUpdateTimeout = 
        //             setTimeout(function(){
        // 		        this.getGraphData(true);
        // 		    }.bind(this), 1000);

        //             this.setState({
        //                 graphUpdateTimeout: graphUpdateTimeout
        //             });
        // 		});
        // 	})
        // 	.catch(function (error) {
        // 	}.bind(this));	
        // });
    }

    filterFloat(value) {
        if (/^(-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value))
            return Number(value);
        return NaN;
    }

    handleBuyFormSubmit() {
        const { authUserData, currentPair } = this.state;

        let buyPriceFiltered = this.filterFloat(this.state.buyPrice);
        let buyAmountFiltered = this.filterFloat(this.state.buyAmount);
        let buyTotalFiltered = this.filterFloat(this.state.buyTotal);

        this.setState({
            buyPrice: '',
            buyAmount: '',
            buyTotal: ''
        }, async () => {
            try {
                await this.api.putOrder({
                    id_user: authUserData.id,
                    id_pair: currentPair.pairId,
                    id_type: 1,
                    id_status: 1,
                    price: buyPriceFiltered,
                    amount1: buyAmountFiltered,
                    amount2: buyTotalFiltered
                });
                this.updateBalances();
            } catch(ex) {
                this.setState({ buyError: ex.response.data });
            }
        });
    }

    handleSellFormSubmit() {
        const { authUserData, currentPair } = this.state;

        let sellPriceFiltered = this.filterFloat(this.state.sellPrice);
        let sellAmountFiltered = this.filterFloat(this.state.sellAmount);
        let sellTotalFiltered = this.filterFloat(this.state.sellTotal);
        
        this.setState({
            sellPrice: '',
            sellAmount: '',
            sellTotal: ''
        }, async () => {
            try {
                await this.api.putOrder({
                    id_user: authUserData.id,
                    id_pair: currentPair.pairId,
                    id_type: 2,
                    id_status: 1,
                    price: sellPriceFiltered,
                    amount1: sellAmountFiltered,
                    amount2: sellTotalFiltered
                });
                this.updateBalances();
            } catch(ex) {
                this.setState({ sellError: ex.response.data });
            }
        });
    }

    handleBuyPriceChange(buyPrice, setZeroTotal) {
        if (typeof (setZeroTotal) === 'undefined')
            setZeroTotal = false;

        let buyAmount = this.filterFloat(this.state.buyAmount);

        let buyTotal = '';

        if (!isNaN(buyAmount) && isFinite(buyAmount) && !isNaN(buyPrice) && isFinite(buyPrice))
            buyTotal = +(buyAmount * buyPrice).toFixed(10);

        this.setState({
            buyPrice,
            buyTotal: (buyTotal ? buyTotal.toFixed(8) : (setZeroTotal ? 0.00000000 : ''))
        });
    }

    handleBuyAmountChange(buyAmount) {
        let buyAmountFiltered = this.filterFloat(buyAmount);

        let buyPrice = this.filterFloat(this.state.buyPrice);

        let buyTotal = '';

        if (!isNaN(buyAmountFiltered) && isFinite(buyAmountFiltered) && !isNaN(buyPrice) && isFinite(buyPrice))
            buyTotal = +(buyAmountFiltered * buyPrice).toFixed(10);

        this.setState({
            buyAmount,
            buyTotal: (buyTotal ? buyTotal.toFixed(8) : '')
        });
    }

    handleBuyPriceAndAmountChange(buyPrice, buyAmount) {
        let buyAmountFiltered = this.filterFloat(buyAmount);

        let buyPriceFiltered = this.filterFloat(buyPrice);

        let buyTotal = '';

        if (!isNaN(buyAmountFiltered) && isFinite(buyAmountFiltered) && !isNaN(buyPriceFiltered) && isFinite(buyPriceFiltered))
            buyTotal = +(buyAmountFiltered * buyPriceFiltered).toFixed(10);

        this.setState({
            buyPrice: (buyPriceFiltered ? buyPriceFiltered.toFixed(8) : ''),
            buyAmount: (buyAmountFiltered ? buyAmountFiltered.toFixed(8) : ''),
            buyTotal: (buyTotal ? buyTotal.toFixed(8) : '')
        });
    }

    handleBuyPriceAndTotalChange(buyPrice, buyTotal) {
        let buyTotalFiltered = this.filterFloat(buyTotal);

        let buyPriceFiltered = this.filterFloat(buyPrice);

        let buyAmount = '';

        if (!isNaN(buyTotalFiltered) && isFinite(buyTotalFiltered) && !isNaN(buyPriceFiltered) && isFinite(buyPriceFiltered))
            buyAmount = +(buyTotalFiltered / buyPriceFiltered).toFixed(10);

        this.setState({
            buyPrice: (buyPriceFiltered ? buyPriceFiltered.toFixed(8) : ''),
            buyAmount: (buyAmount ? buyAmount.toFixed(8) : ''),
            buyTotal: (buyTotalFiltered ? buyTotalFiltered.toFixed(8) : '')
        });
    }

    handleBuyTotalChange(buyTotal) {
        let buyTotalFiltered = this.filterFloat(buyTotal);

        let buyPrice = this.filterFloat(this.state.buyPrice);

        let buyAmount = '';

        if (!isNaN(buyTotalFiltered) && isFinite(buyTotalFiltered) && !isNaN(buyPrice) && isFinite(buyPrice) && buyPrice !== 0)
            buyAmount = +(buyTotalFiltered / buyPrice).toFixed(10);

        this.setState({
            buyAmount: (buyAmount ? buyAmount.toFixed(8) : ''),
            buyTotal
        });
    }

    handleSellPriceChange(sellPrice, setZeroTotal) {
        if (typeof (setZeroTotal) === 'undefined')
            setZeroTotal = false;

        let sellAmount = this.filterFloat(this.state.sellAmount);

        let sellTotal = '';

        if (!isNaN(sellAmount) && isFinite(sellAmount) && !isNaN(sellPrice) && isFinite(sellPrice))
            sellTotal = +(sellAmount * sellPrice).toFixed(10);

        this.setState({
            sellPrice,
            sellTotal: (sellTotal ? sellTotal.toFixed(8) : (setZeroTotal ? 0.00000000 : ''))
        });
    }

    handleSellAmountChange(sellAmount) {
        let sellAmountFiltered = this.filterFloat(sellAmount);

        let sellPrice = this.filterFloat(this.state.sellPrice);

        let sellTotal = '';

        if (!isNaN(sellAmountFiltered) && isFinite(sellAmountFiltered) && !isNaN(sellPrice) && isFinite(sellPrice))
            sellTotal = +(sellAmountFiltered * sellPrice).toFixed(10);

        this.setState({
            sellAmount,
            sellTotal: (sellTotal ? sellTotal.toFixed(8) : '')
        });
    }

    handleSellPriceAndAmountChange(sellPrice, sellAmount) {
        let sellAmountFiltered = this.filterFloat(sellAmount);

        let sellPriceFiltered = this.filterFloat(sellPrice);

        let sellTotal = '';

        if (!isNaN(sellAmountFiltered) && isFinite(sellAmountFiltered) && !isNaN(sellPriceFiltered) && isFinite(sellPriceFiltered))
            sellTotal = +(sellAmountFiltered * sellPriceFiltered).toFixed(10);

        this.setState({
            sellPrice: (sellPriceFiltered ? sellPriceFiltered.toFixed(8) : ''),
            sellAmount: (sellAmountFiltered ? sellAmountFiltered.toFixed(8) : ''),
            sellTotal: (sellTotal ? sellTotal.toFixed(8) : '')
        });
    }

    handleSellPriceAndTotalChange(sellPrice, sellTotal) {
        let sellTotalFiltered = this.filterFloat(sellTotal);

        let sellPriceFiltered = this.filterFloat(sellPrice);

        let sellAmount = '';

        if (!isNaN(sellTotalFiltered) && isFinite(sellTotalFiltered) && !isNaN(sellPriceFiltered) && isFinite(sellPriceFiltered))
            sellAmount = +(sellTotalFiltered / sellPriceFiltered).toFixed(10);

        this.setState({
            sellPrice: (sellPriceFiltered ? sellPriceFiltered.toFixed(8) : ''),
            sellAmount: (sellAmount ? sellAmount.toFixed(8) : ''),
            sellTotal: (sellTotalFiltered ? sellTotalFiltered.toFixed(8) : '')
        });
    }

    handleSellTotalChange(sellTotal) {
        let sellTotalFiltered = this.filterFloat(sellTotal);

        let sellPrice = this.filterFloat(this.state.sellPrice);

        let sellAmount = '';

        if (!isNaN(sellTotalFiltered) && isFinite(sellTotalFiltered) && !isNaN(sellPrice) && isFinite(sellPrice) && sellPrice !== 0)
            sellAmount = +(sellTotalFiltered / sellPrice).toFixed(10);

        this.setState({
            sellAmount: (sellAmount ? sellAmount.toFixed(8) : ''),
            sellTotal
        });
    }

    changeLanguage(language) {
        cookies.set('language', language, { path: '/' });

        let langId = language === 'EN' ? 1 : 2;

        this.setState({
            language,
            languageId: langId
        });
    }

    render() {
        const { loading, authUserData } = this.state;

        if (loading) {
            return <div className="website website_loading"></div>;
        } else {            
            return (
                <Router>
                    <React.Fragment>                        
                        <Header
                            logout={this.logout}
                            setLanguage={this.changeLanguage}
                            language={this.state.language}
                            t={this.state.translations}
                            authUserData={this.state.authUserData} />
                        <Switch>
                            <Route path="/" exact>
                                <MainPage language={this.state.language} t={this.state.translations} />
                            </Route>
                            <Route path="/admin/transfer" exact>
                                <iframe title="transfer" src={`https://api.wacdaq.pro/admin/transfer?uauthkey=${authUserData.auth_key}&uid=${authUserData.id}`} style={{ overflow: 'hidden', width: '100%', position: 'fixed', top: 0, bottom: 0, zIndex: 100, backgroundColor: '#fff' }} height="100%" width="100%"></iframe>
                            </Route>
                            <Route path="/marketmaker" exact>
                                <iframe title="marketmaker" src={`https://api.wacdaq.pro/marketmaker?uauthkey=${authUserData.auth_key}&uid=${authUserData.id}`} style={{ overflow: 'hidden', width: '100%', position: 'fixed', top: 0, bottom: 0, zIndex: 100, backgroundColor: '#fff' }} height="100%" width="100%"></iframe>
                            </Route>
                            <Route path="/start/" exact>
                                <StartTrading
                                    language={this.state.language}
                                    t={this.state.translations}
                                    authUserData={this.state.authUserData}
                                />
                            </Route>
                            <Route path="/history/" exact>
                                <History language={this.state.language} t={this.state.translations} />
                            </Route>
                            <Route path="/listing/" exact>
                                <Listing language={this.state.language} t={this.state.translations} />
                            </Route>
                            <Route path="/support/" exact>
                                <ListingForm
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/blog/add" exact render={props => (
                                <BlogForm
                                    {...props}
                                    action="add"
                                    authUserData={this.state.authUserData}
                                    language={this.state.language}
                                    languageId={this.state.languageId}
                                    t={this.state.translations}
                                />
                            )} />
                            <Route path="/blog/edit/:id(\d+)" exact render={props => (
                                <BlogForm
                                    {...props}
                                    action="edit"
                                    authUserData={this.state.authUserData}
                                    language={this.state.language}
                                    languageId={this.state.languageId}
                                    t={this.state.translations}
                                />
                            )} />
                            <Route path="/blog/:id(\d+)" exact render={props => (
                                <BlogNews
                                    {...props}
                                    authUserData={this.state.authUserData}
                                    language={this.state.language}
                                    languageId={this.state.languageId}
                                    t={this.state.translations}
                                />
                            )} />
                            <Route path="/blog/" exact>
                                <BlogList
                                    authUserData={this.state.authUserData}
                                    language={this.state.language}
                                    languageId={this.state.languageId}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/vote/" exact>
                                <Vote
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/voteproject/" exact>
                                <VoteItem
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/fees/" exact>
                                <Fees
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/exchange/" exact>
                                <Exchange
                                    api={this.api}
                                    updating={this.state.updating}

                                    authUserData={this.state.authUserData}

                                    language={this.state.language}
                                    t={this.state.translations}

                                    handleSellPriceAndAmountChange={this.handleSellPriceAndAmountChange}
                                    handleBuyPriceAndAmountChange={this.handleBuyPriceAndAmountChange}

                                    handleSellPriceAndTotalChange={this.handleSellPriceAndTotalChange}
                                    handleBuyPriceAndTotalChange={this.handleBuyPriceAndTotalChange}

                                    sellPriceDefaultSet={this.state.sellPriceDefaultSet}
                                    buyPriceDefaultSet={this.state.buyPriceDefaultSet}
                                    handleSellDefaultSet={this.handleSellDefaultSet}
                                    handleBuyDefaultSet={this.handleBuyDefaultSet}

                                    // deleteOrder={this.deleteOrder}

                                    handleBuyFormSubmit={this.handleBuyFormSubmit}
                                    handleSellFormSubmit={this.handleSellFormSubmit}

                                    handleBuyPriceChange={this.handleBuyPriceChange}
                                    buyPrice={this.state.buyPrice}
                                    handleBuyAmountChange={this.handleBuyAmountChange}
                                    buyAmount={this.state.buyAmount}
                                    handleBuyTotalChange={this.handleBuyTotalChange}
                                    buyTotal={this.state.buyTotal}
                                    buyError={this.state.buyError}

                                    handleSellPriceChange={this.handleSellPriceChange}
                                    sellPrice={this.state.sellPrice}
                                    handleSellAmountChange={this.handleSellAmountChange}
                                    sellAmount={this.state.sellAmount}
                                    handleSellTotalChange={this.handleSellTotalChange}
                                    sellTotal={this.state.sellTotal}
                                    sellError={this.state.sellError}

                                    selectPair={this.selectPair}
                                    currentPair={this.state.currentPair}
                                    pairs={this.state.pairs}
    
                                    updateBalances={this.updateBalances}
                                    balances={this.state.balances} 
                                // orderBook={this.state.orderBook}
                                // orderBookLength={this.state.orderBookLength}

                                // marketDepth={this.state.marketDepth}
                                // marketDepthLength={this.state.marketDepthLength}

                                // tradeHistory={this.state.tradeHistory} 
                                // myOrders={this.state.myOrders}
                                />
                            </Route>
                            <Route path="/login" exact>
                                <Login
                                    authUserData={this.state.authUserData}
                                    login={this.login}
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>
                            <Route path="/confirm_email" exact>
                                <ConfirmEmail
                                    language={this.state.language}
                                    t={this.state.translations}
                                />
                            </Route>

                            <Route path="/finance" exact>                                  
                                    <DepositsAndWithdrawals
                                        language={this.state.language}
                                        t={this.state.translations}
                                        updateBalances={this.updateBalances}
                                        data={this.state.balances}
                                        authUserData={this.state.authUserData}
                                        currentPair={this.state.currentPair}
                                        popupResult={this.state.popupResult}
                                        openPopup={this.popupOpen}
                                        popupKey={this.state.popupKey}
                                    />                            
                            </Route>                            
                            <Route path="/projects" component={CoinInfo} />
                            <Route path="/resetpassword" exact render={(props) => {
                                const { location } = props;
                                const re = /\\?key=/i;
                                if (location.search !== '' && re.test(location.search)) {
                                    return <ResetPassword {...props} language={this.state.language} t={this.state.translations} authUserData={this.state.authUserData} login={this.login} />
                                } else {                                    
                                    return <RequestResetPassword {...props} language={this.state.language} t={this.state.translations} authUserData={this.state.authUserData} login={this.login} />
                                }
                            }}>
                            </Route>
                            <Route path="/setting"  render={(props) => {
                                return <Settings {...props} language={this.state.language} t={this.state.translations} authUserData={this.state.authUserData} login={this.login} />
                                /*return <Fees language={this.state.language} t={this.state.translations}/> */
                                /*return <ResetPassword {...props} language={this.state.language} t={this.state.translations} authUserData={this.state.authUserData} login={this.login} />*/
                            }}>
                            </Route>
                            <Route>
                                <NotFound />
                            </Route>
                        </Switch>
                        <Footer
                            language={this.state.language}
                            t={this.state.translations}
                            authUserData={this.state.authUserData}
                        />
                    </React.Fragment>
                </Router>
            );
        }
    }
}

export default pagesRouter;
