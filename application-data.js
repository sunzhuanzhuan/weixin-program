const _ = require('./utils/lodash.custom.min.js');
const EventEmitter = require("./utils/EventEmitter.min.js");
const request = require("./utils/request.js").request;
const download = require("./utils/request.js").download;

const PAGESIZE = 20;

const __FAILSAFE_DEMO_EXTCONFIG = {
    "distroId": "5b63fb56b106d81d9b74972a",
    "appToken": "JIoR14MrZZlReOfpJP7ocGF3bhpPq6BY_OiROkRRmdo",
    "appName": "",
    "baseUri": "https://yijoin-d.weiboyi.com/v1/distribution"
};

module.exports = class GlobalDataContext extends EventEmitter {

    constructor(launchParam, entityTypes) {
        super();
        this.entityTypes = entityTypes;
        this.launchTime = Date.now();
        this.launchParam = launchParam;
        this.showParam = launchParam;
        this.extConfig = new Promise((resolve, reject) => {
            wx.getExtConfig({
                success: (x) => resolve(_.merge(__FAILSAFE_DEMO_EXTCONFIG, x.extConfig)),
                fail: reject
            });
        });

        this.baseServerUri = this.extConfig.then((x) => x.baseUri);
        this.appToken = this.extConfig.then((x) => x.appToken);
        this.distroId = this.extConfig.then((x) => x.distroId);
        this.appName = this.extConfig.then((x) => x.appName);

        this.localStorage = new Promise((resolve, reject) => {
            wx.getStorageInfo({
                success: (res) => {
                    if (res.keys) {
                        const storageSnapshot = {};
                        Promise.all(res.keys.map((x) => {
                            return new Promise((_res, _rej) => {
                                wx.getStorage({
                                    key: x,
                                    success: (_x) => {
                                        storageSnapshot[x] = _x.data;
                                        _res(_x.data);
                                    },
                                    fail: _rej
                                });
                            });
                        })).then(() => resolve(storageSnapshot), reject);
                        return;
                    }
                    return resolve({});
                },
                fail: reject
            });
        });

        wx.onNetworkStatusChange((x) => {
            this.emit('networkStatusChange', x);
        });

        this.localState = {
            sessionToken: ''
        };


        this.sessionToken = new Promise((resolve, reject) => {
            this.on('sessionToken', (x) => {
                this.localState.sessionToken = x;
                resolve(x);
                this.sessionToken = Promise.resolve(x);
            });
        });

        this.applicationKickOff();

    }

    get systemInfo() {
        return new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success: resolve,
                fail: reject
            });
        });
    }

    get networkType() {
        return new Promise((resolve, reject) => {
            wx.getNetworkType({
                success: (x) => resolve(x.networkType),
                fail: reject
            });
        });
    }

    get authSetting() {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: (x) => resolve(x.authSetting),
                fail: reject
            });
        });
    }

    onAppShow(showParam) {
        this.showParam = showParam;
        this.emit('appShow', showParam);
    }

    onAppHide() {
        this.emit('appHide');
    }

    onAppError(err) {
        this.emit('appError', err);
    }

    composeApiUrl(uri) {
        return this.extConfig.then((x) => {
            return `${x.baseUri}/${x.distroId}/${uri}`.replace(/((?!\:)\/+)/gi, '/').replace(/\:\//, '://').replace(/\/+$/, '');
        });
    }

    simpleApiCall(method, uri, otherOptions) {
        const queryOptions = otherOptions || {};
        if (this.localState.sessionToken) {
            const queryHeaders = queryOptions.header || {};
            queryHeaders['X-Session-Token'] = this.localState.sessionToken;
            queryOptions.header = queryHeaders;
        }
        let simpleMode = true;
        if (queryOptions.notSimple) {
            simpleMode = false;
        }
        delete queryOptions.notSimple;

        let autoLoadingState = false;
        if (queryOptions.autoLoadingState) {
            autoLoadingState = true;
        }
        delete queryOptions.autoLoadingState;

        if (autoLoadingState) {
            this.emit('loading');
        }

        return this.composeApiUrl(uri)
            .then((url) => {
                return request(
                    method,
                    url,
                    queryOptions
                ).then((res) => {
                    if (autoLoadingState) {
                        this.emit('loadingComplete');
                    }
                    if (res.header) {
                        const TOKEN_HEADER_NAME = 'X-Set-Session-Token';
                        const tokenValue = res.header[TOKEN_HEADER_NAME] || res.header[TOKEN_HEADER_NAME.toLowerCase()];
                        if (tokenValue) {
                            this.emit('sessionToken', tokenValue);
                        }
                        if (res.header['Set-Cookie']) {
                            this.emit('cookie', res.header['Set-Cookie']);
                        }
                    }
                    if (simpleMode) {
                        const body = res.data;

                        if (res.statusCode !== 200) {
                            return Promise.reject(body);
                        }

                        if (body && body.data) {
                            return body.data;
                        }

                        return body;
                    }

                    return res;
                }, (err) => {
                    if (autoLoadingState) {
                        this.emit('loadingComplete');
                    }
                    return Promise.reject(err);
                });
            });
    }

    simpleApiDownload(uri, otherOptions) {
        const queryOptions = otherOptions || {};
        if (this.localState.sessionToken) {
            const queryHeaders = queryOptions.header || {};
            queryHeaders['X-Session-Token'] = this.localState.sessionToken;
            queryOptions.header = queryHeaders;
        }
        let simpleMode = true;
        if (queryOptions.notSimple) {
            simpleMode = false;
        }
        delete queryOptions.notSimple;

        let autoLoadingState = false;
        if (queryOptions.autoLoadingState) {
            autoLoadingState = true;
        }
        delete queryOptions.autoLoadingState;

        if (autoLoadingState) {
            this.emit('loading');
        }

        return this.composeApiUrl(uri)
            .then((url) => {
                return download(
                    url,
                    queryOptions
                ).then((res) => {
                    if (autoLoadingState) {
                        this.emit('loadingComplete');
                    }
                    if (res.header) {
                        const TOKEN_HEADER_NAME = 'X-Set-Session-Token';
                        const tokenValue = res.header[TOKEN_HEADER_NAME] || res.header[TOKEN_HEADER_NAME.toLowerCase()];
                        if (tokenValue) {
                            this.emit('sessionToken', tokenValue);
                        }
                        if (res.header['Set-Cookie']) {
                            this.emit('cookie', res.header['Set-Cookie']);
                        }
                    }
                    if (simpleMode) {
                        const filePath = res.tempFilePath || queryOptions.filePath;

                        if (res.statusCode !== 200) {
                            return Promise.reject(res);
                        }

                        return filePath;
                    }

                    return res;
                }, (err) => {
                    if (autoLoadingState) {
                        this.emit('loadingComplete');
                    }
                    return Promise.reject(err);
                });
            });
    }

    loginWithAuthorizationCode(code) {
        return this.appToken.then((appToken) => {
            return this.simpleApiCall('POST', '/login', {
                body: {
                    appToken: appToken,
                    code: code
                }
            });
        })
    }

    autoLogin() {
        const loginPromise = new Promise((resolve, reject) => {
            wx.login({
                success: resolve,
                reject: reject
            });
        });
        return loginPromise.then((x) => this.loginWithAuthorizationCode(x.code));
    }

    checkAndFixUserLogin() {
        if (this.__firstLogin !== 'done') {
            return this.currentUser;
        }
        const oldUserPromise = this.currentUser;
        this.currentUser = new Promise((resolve, reject) => {
            wx.checkSession({
                success: resolve,
                reject: reject
            });
        })
            .then(() => this.getMyLegacyProfileFromServer())
            .then(() => oldUserPromise)
            .catch(() => this.autoLogin());

        return this.currentUser;
    }

    getMyLegacyProfileFromServer() {
        return this.simpleApiCall('GET', '/my/profile');
    }

    uploadMyProfile(encryptedData, iv) {
        return this.currentUser.then(() => {
            return this.simpleApiCall('POST', '/my/profile', {
                body: {
                    encryptedData: encryptedData,
                    iv: iv
                }
            });
        });
    }

    applicationKickOff() {

        this.appBaseInfo = this.fetchDistributionIndex();

        this.currentUser = this.appBaseInfo.then(() => this.autoLogin());
        this.currentUser.then(() => {
            this.__firstLogin = 'done';
        });
        this.userInfo = this.authSetting.then((authSetting) => {
            if (authSetting['scope.userInfo']) {
                return this.currentUser.then(() => {
                    return new Promise((resolve, reject) => {
                        wx.getUserInfo({
                            withCredentials: true,
                            success: (x) => {
                                resolve(x);
                                this.emit('userInfo', x);
                            },
                            lang: 'zh_CN',
                            fail: reject
                        });
                    });
                });
            }

            // Not authorized for UserInfo.
            this.on('userInfo', () => {
                this.track('userInfoAuthorized');
            });
            return Promise.reject(null);
        });

        this.on('userInfo', (userInfo) => {
            this.userInfo = Promise.resolve(userInfo);
            this.uploadMyProfile(userInfo.encryptedData, userInfo.iv);
        });

        this.localState.lists = [];
        this.localState.myLikes = [];
        this.localState.myShares = [];
        this.localState.pendingRequests = 0;
        this.localState.autoLoadingState = true;
        this.localState.dashboardAnalytics = {};
        this.localState.localStorage = {};
        this.localState.clipIndex = {};

        this.localStorage.then((storageObj) => {
            this.localState.localStorage = storageObj;
        });

        this.on('loading', () => {
            const originalPendingRequests = this.localState.pendingRequests;
            this.localState.pendingRequests += 1;
            if (originalPendingRequests === 0 && this.localState.autoLoadingState) {
                wx.showLoading({ title: '加载中' });
            }
        });

        this.on('loadingComplete', () => {
            this.localState.pendingRequests -= 1;
            if (this.localState.pendingRequests <= 0) {
                this.localState.pendingRequests = 0;
                if (this.localState.autoLoadingState) {
                    wx.hideLoading({});
                }
            }
        });

        this.on('dashboardAnalytics', (x) => {
            _.merge(this.localState.dashboardAnalytics, x);
        });

        const deferred = {};
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });

        this.ready = deferred.promise;

        this.once('applicationIndex', (appBaseInfo) => {
            this.localState.title = appBaseInfo.title;
            this.localState.description = appBaseInfo.description;
            this.localState.avatarUrl = appBaseInfo.avatarUrl;
            this.localState.lists = appBaseInfo.lists;
            this.localState.pendingAudition = appBaseInfo.pendingAudition;
            if (this.localState.pendingAudition) {
                this.entityTypes = ['wxArticle']
            }
            if (this.localState.lists.length) {
                this.localState.lists.forEach((x) => {
                    x.items = [];
                });
            }
            this.localState.listIndex = _.keyBy(this.localState.lists, '_id');
            this.localState.listIndex['topScoreds'] = {
                title: '推荐',
                items: []
            };
            this.localState.itemIndex = {};
            this.localStorage.then(() => {
                this.emit('ready', this.localState);
                deferred.resolve(this.localState);
            }).catch(deferred.reject);
        });

        this.on('listItems', (listId, [start, end], entities) => {
            const listInstance = this.localState.listIndex[listId];
            const targetList = listInstance.items;
            const itemIndex = this.localState.itemIndex;
            if ((entities && entities.length < (end - start))) {
                listInstance.__hasMore = false;
            }
            if (start === 0) {
                entities.reverse().forEach((x) => {
                    let indexedItem = itemIndex[x._id];
                    if (indexedItem) {
                        _.merge(indexedItem, x);
                    } else {
                        indexedItem = x;
                        itemIndex[x._id] = indexedItem;
                    }

                    if (!indexedItem.randomNum) {
                        indexedItem.randomNum = Math.floor(Math.random() * 40);
                    }
                    indexedItem.wxMidVec ='1234#1'
                    const r = _.find(targetList, { _id: x._id });
                    if (r) {
                        return;
                    }
                    targetList.unshift(indexedItem);
                    return;
                });

                return;
            }

            _.range(start, end, 1).map((idx, incomingIdx) => {
                const incoming = entities[incomingIdx];
                if (!incoming) {
                    return;
                }
                let indexedItem = itemIndex[incoming._id];
                if (indexedItem) {
                    _.merge(indexedItem, incoming);
                } else {
                    indexedItem = incoming;
                    itemIndex[incoming._id] = indexedItem;
                }
                if (!indexedItem.randomNum) {
                    indexedItem.randomNum = Math.floor(Math.random() * 40);
                }
                indexedItem.wxMidVec ='1234#1'
                let curItem = targetList[idx];
                if (curItem) {
                    return;
                }

                targetList[idx] = indexedItem;
                return;
            });
        });

        this.on('entityUpdate', (entity) => {
            const itemIndex = this.localState.itemIndex;

            let indexedItem = itemIndex[entity._id];
            if (indexedItem) {
                _.merge(indexedItem, entity);
            } else {
                indexedItem = entity;
                itemIndex[entity._id] = indexedItem;
            }

            if (!indexedItem.randomNum) {
                indexedItem.randomNum = Math.floor(Math.random() * 40);
            }
            indexedItem.wxMidVec ='1234#1'
            return;
        });

        this.on('sharedItems', ([start, end], clips) => {
            const targetList = this.localState.myShares;
            const itemIndex = this.localState.clipIndex;;
            if ((clips && clips.length < (end - start))) {
                targetList.__hasMore = false;
            }
            if (start === 0) {
                clips.reverse().forEach((x) => {
                    let indexedItem = itemIndex[x._id];
                    if (indexedItem) {
                        _.merge(indexedItem, x);
                    } else {
                        indexedItem = x;
                        itemIndex[x._id] = indexedItem;
                    }

                    const r = _.find(targetList, { _id: x._id });
                    if (r) {
                        _.remove(targetList, r);
                    }
                    targetList.unshift(indexedItem);
                    return;
                });

                return;
            }

            _.range(start, end, 1).map((idx, incomingIdx) => {
                const incoming = clips[incomingIdx];
                if (!incoming) {
                    return;
                }
                let indexedItem = itemIndex[incoming._id];
                if (indexedItem) {
                    _.merge(indexedItem, incoming);
                } else {
                    indexedItem = incoming;
                    itemIndex[incoming._id] = indexedItem;
                }
                let curItem = targetList[idx];
                if (curItem) {
                    return;
                }

                targetList[idx] = indexedItem;
                return;
            });
        });

        this.on('shared', (x) => {
            const targetList = this.localState.myShares;
            const itemIndex = this.localState.clipIndex;
            let indexedItem = itemIndex[x._id];
            if (indexedItem) {
                _.merge(indexedItem, x);
            } else {
                indexedItem = x;
                itemIndex[x._id] = indexedItem;
            }
            this.localState.dashboardAnalytics.shared = (this.localState.dashboardAnalytics.shared + 1) || 1;
            if (x.entity) {
                this.emit('entityUpdate', x.entity);
            }
            const r = _.find(targetList, { _id: x._id });
            if (r) {
                return;
            }

            targetList.unshift(indexedItem);
        });

        this.on('likedItems', ([start, end], clips) => {
            const targetList = this.localState.myLikes;
            const itemIndex = this.localState.clipIndex;
            if ((clips && clips.length < (end - start))) {
                targetList.__hasMore = false;
            }
            if (start === 0) {
                clips.reverse().forEach((x) => {
                    let indexedItem = itemIndex[x._id];
                    if (indexedItem) {
                        _.merge(indexedItem, x);
                    } else {
                        indexedItem = x;
                        itemIndex[x._id] = indexedItem;
                    }

                    const r = _.find(targetList, { _id: x._id });
                    if (r) {
                        return;
                    }
                    targetList.unshift(indexedItem);
                    return;
                });

                return;
            }

            _.range(start, end, 1).map((idx, incomingIdx) => {
                const incoming = clips[incomingIdx];
                if (!incoming) {
                    return;
                }
                let indexedItem = itemIndex[incoming._id];
                if (indexedItem) {
                    _.merge(indexedItem, incoming);
                } else {
                    indexedItem = incoming;
                    itemIndex[incoming._id] = indexedItem;
                }
                let curItem = targetList[idx];
                if (curItem) {
                    return;
                }

                targetList[idx] = indexedItem;
                return;
            });
        });

        this.on('liked', (x) => {
            const targetList = this.localState.myLikes;
            const itemIndex = this.localState.clipIndex;
            let indexedItem = itemIndex[x._id];
            if (indexedItem) {
                _.merge(indexedItem, x);
            } else {
                indexedItem = x;
                itemIndex[x._id] = indexedItem;
            }
            this.localState.dashboardAnalytics.liked = (this.localState.dashboardAnalytics.liked + 1) || 1;
            if (x.entity) {
                this.emit('entityUpdate', x.entity);
            }
            const r = _.find(targetList, { _id: x._id });
            if (r) {
                return;
            }

            targetList.unshift(indexedItem);
        });
        this.on('unliked', (x) => {
            const targetList = this.localState.myLikes;
            const itemIndex = this.localState.clipIndex;
            let indexedItem = itemIndex[x._id];
            if (indexedItem) {
                _.merge(indexedItem, x);
            } else {
                indexedItem = x;
                itemIndex[x._id] = indexedItem;
            }
            this.localState.dashboardAnalytics.liked = (this.localState.dashboardAnalytics.liked - 1) || 0;
            if (x.entity) {
                this.emit('entityUpdate', x.entity);
            }
            _.remove(targetList, (v) => v._id === x._id);
        });

        this.ready.then(() => {
            this.track('launch');
        });

        this.on('appHide', () => {
            this.track('hide', { duration: Date.now() - this.launchTime });
        })
    }

    setLocalStorage(k, v) {
        this.localState.localStorage[k] = v;
        return new Promise((resolve, reject) => {
            wx.setStorage({
                key: k,
                data: v,
                success: resolve,
                fail: reject
            });
        }).then(() => {
            this.emit('storageSet', k, v);
        });
    }

    suspendAutoLoadingState() {
        this.localState.autoLoadingState = false;
        wx.hideLoading({});
    }

    activateAutoLoadingState() {
        this.localState.autoLoadingState = true;
    }

    fetchDistributionIndex() {
        const queryPromise = this.simpleApiCall('GET', '/');
        queryPromise.then((x) => this.emit('applicationIndex', x));
        return queryPromise;
    }

    fetchListItems(listId, page, pageSize, _queryParams) {
        const SPECIAL_LISTS = {
            topScoreds: '/topScoreds'
        };
        if (!page) {
            page = 1;
        }
        if (!pageSize) {
            pageSize = 20;
        }
        if (!listId) {
            return []
        }
        const startIndex = pageSize * (page - 1);
        const endIndex = startIndex + pageSize;
        this.__fetchListOps = this.__fetchListOps || {};
        const lockKey = `${listId}:${startIndex}-${endIndex}`;
        const lastPendingOp = this.__fetchListOps[lockKey];
        if (lastPendingOp) {
            return lastPendingOp;
        }
        const qParams = {};
        if (Array.isArray(this.entityTypes) && this.entityTypes.length) {
            qParams.types = this.entityTypes.join(',');
        }
        const qUri = SPECIAL_LISTS[listId] || `/list/${listId}/entities`;
        const queryPromise = this.currentUser.then(() => {
            return this.simpleApiCall(
                'GET', qUri,
                {
                    query: _.merge({ page: page, pageSize: pageSize }, qParams, _queryParams || {}),
                    autoLoadingState: true
                });
        });

        this.__fetchListOps[lockKey] = queryPromise;
        queryPromise.then((x) => {
            this.__fetchListOps[lockKey] = null;
            this.emit('listItems', listId, [startIndex, endIndex], x);
            this.emit(`listItems-${listId}`, [startIndex, endIndex], x);
        }, (x) => {
            this.__fetchListOps[lockKey] = null;
            return Promise.reject(x);
        });

        return queryPromise;
    }

    magicListItemLoadMore(listId) {
        const listInstance = this.localState.listIndex[listId];

        if (listInstance && listInstance.__hasMore === false) {
            return Promise.resolve();
        }
        const currentLength = listInstance.items ? listInstance.items.length || 0 : 0;
        const nextPage = Math.floor(currentLength / PAGESIZE) + 1;
        return this.fetchListItems(listId, nextPage, PAGESIZE);
    }

    magicListItemLoadLatest(listId) {
        const listInstance = this.localState.listIndex[listId];
        if (!listInstance) {
            return Promise.resolve();
        }
        return this.fetchListItems(listId, 1, PAGESIZE);
    }

    magicListItemFirstLoad(listId) {
        const listInstance = this.localState.listIndex[listId];
        if (!listInstance) {
            return Promise.resolve();
        }
        if (!listInstance.items.length) {
            return this.fetchListItems(listId, 1, PAGESIZE);
        }
        return Promise.resolve();
    }

    fetchDashboardAnalytics() {
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('GET', '/my/readCount', { autoLoadingState: true });
            queryPromise.then((x) => {
                this.emit('dashboardAnalytics', x);
            });
            return queryPromise;
        });
    }

    fetchMySharedItems(page, pageSize) {
        if (!page) {
            page = 1;
        }
        if (!pageSize) {
            pageSize = 20;
        }
        if (this.localState.__currentFetchMySharedsOp) {
            return this.localState.__currentFetchMySharedsOp;
        }
        return this.currentUser.then((u) => {
            const queryPromise = this.simpleApiCall('GET', '/my/shares', {
                query: {
                    page: page,
                    pageSize: pageSize
                },
                autoLoadingState: true
            });
            this.localState.__currentFetchMySharedsOp = queryPromise;
            queryPromise.then((x) => {
                this.localState.__currentFetchMySharedsOp = null;
                const startIndex = pageSize * (page - 1);
                const endIndex = startIndex + pageSize;
                this.emit('sharedItems', [startIndex, endIndex], x);
            }, (err) => {
                this.localState.__currentFetchMySharedsOp = null;
                return Promise.reject(err);
            });
            return queryPromise;
        });
    }

    magicMySharedLoadMore() {
        const myShares = this.localState.myShares;
        if (myShares.__hasMore === false) {
            return Promise.resolve();
        }
        const currentLength = myShares.length;
        const nextPage = Math.floor(currentLength / PAGESIZE) + 1;
        return this.fetchMySharedItems(nextPage, PAGESIZE);
    }

    magicMySharedFirstLoad() {
        const myShares = this.localState.myShares;
        if (!myShares.length) {
            return this.fetchMySharedItems(1, PAGESIZE);
        }
        return Promise.resolve();
    }

    fetchMyLikedItems(page, pageSize) {
        if (!page) {
            page = 1;
        }
        if (!pageSize) {
            pageSize = 20;
        }
        if (this.localState.__currentFetchMyLikesOp) {
            return this.localState.__currentFetchMyLikesOp;
        }
        return this.currentUser.then((u) => {
            const queryPromise = this.simpleApiCall('GET', '/my/likes', {
                query: {
                    page: page,
                    pageSize: pageSize
                },
                autoLoadingState: true
            });
            this.localState.__currentFetchMyLikesOp = queryPromise;
            queryPromise.then((x) => {
                this.localState.__currentFetchMyLikesOp = null;
                const startIndex = pageSize * (page - 1);
                const endIndex = startIndex + pageSize;
                this.emit('likedItems', [startIndex, endIndex], x);
            }, (err) => {
                this.localState.__currentFetchMyLikesOp = null;
                return Promise.reject(err);
            });
            return queryPromise;
        });
    }

    magicMyLikedLoadMore() {
        const myLikes = this.localState.myLikes;
        if (myLikes.__hasMore === false) {
            return Promise.resolve();
        }
        const currentLength = myLikes.length;
        const nextPage = Math.floor(currentLength / PAGESIZE) + 1;
        return this.fetchMyLikedItems(nextPage, PAGESIZE);
    }

    magicMyLikedFirstLoad() {
        const myLikes = this.localState.myLikes;
        if (!myLikes.length) {
            return this.fetchMyLikedItems(1, PAGESIZE);
        }
        return Promise.resolve();
    }

    fetchArticleDetail(articleId, options) {
        console.warn('GDT: Article API is deprecated ! Use entity API insted !!');
        const qOptions = _.merge({
            mapSrc: 'data',
            overrideStyle: 'false',
            fixWxMagicSize: 'true',
        }, options || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall(
                'GET', `/article/${articleId}/richText`,
                {
                    query: qOptions,
                    autoLoadingState: true
                }
            );
            queryPromise.then((x) => {
                this.emit('articleDetail', articleId, x);
            });

            return queryPromise;
        });
    }

    fetchEntityDetail(entityId, options) {
        const qOptions = _.merge({
        }, options || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall(
                'GET', `/entity/${entityId}/detail`,
                {
                    query: qOptions,
                    autoLoadingState: true
                }
            );
            queryPromise.then((x) => {
                this.emit('entityDetail', x);
            });

            return queryPromise;
        });
    }

    fetchEntityDetailByReferenceId(referenceId, options) {
        const qOptions = _.merge({
        }, options || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall(
                'GET', `/reference/${referenceId}/detail`,
                {
                    query: qOptions,
                    autoLoadingState: true
                }
            );
            queryPromise.then((x) => {
                this.emit('entityDetail', x);
            });

            return queryPromise;
        });
    }

    fetchArticleDetailByReferenceId(referenceId, options) {
        console.warn('GDT: Article API is deprecated ! Use entity API insted !!');
        const qOptions = _.merge({
            mapSrc: 'data',
            overrideStyle: 'false',
            fixWxMagicSize: 'true',
        }, options || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall(
                'GET', `/reference/${referenceId}/richText`,
                {
                    query: qOptions,
                    autoLoadingState: true
                }
            );
            queryPromise.then((x) => {
                this.emit('articleDetail', x);
            });

            return queryPromise;
        });
    }

    fetchEntityMeta(entityId) {

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall(
                'GET', `/entity/${entityId}`
            );
            queryPromise.then((x) => {
                this.emit('entityMeta', x);
            });

            return queryPromise;
        });
    }

    likeItem(itemId) {
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/likes', {
                body: {
                    entityId: itemId
                }
            });

            queryPromise.then((x) => {
                this.emit('liked', x);
            });

            return queryPromise;
        });
    }

    unlikeItem(itemId) {
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/likes', {
                query: {
                    action: 'del'
                },
                body: {
                    entityId: itemId
                }
            });

            queryPromise.then((x) => {
                this.emit('unliked', x);
            });

            return queryPromise;
        });
    }

    trackShareItem(itemId, otherOptions) {
        const queryBody = _.merge({ entityId: itemId }, otherOptions || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/shares', {
                body: queryBody
            });

            queryPromise.then((x) => {
                this.emit('shared', x);
            });

            return queryPromise;
        });
    }

    trackScrollActionInViewing(articleId, viewId, tPlus, duration, startPos, endPos) {
        // Direct tracking is deprecated.
        console.warn('GDT: Direct scroll tracking is deprecated ! Dont use this any more !!');
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/scrolls', {
                body: {
                    article: articleId,
                    view: viewId,
                    tPlus: tPlus,
                    duration: duration,
                    startPos: startPos,
                    endPos: endPos
                }
            });

            return queryPromise;
        });
    }

    trackLeftViewing(entityId, viewId, duration) {
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/lefts', {
                body: {
                    entityId: entityId,
                    view: viewId,
                    duration: duration
                }
            });

            return queryPromise;
        });
    }

    trackVideoPlay(entityId, refId) {
        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/views', {
                body: {
                    entityId: entityId,
                    scene: this.showParam.scene,
                    ref: refId
                }
            });

            return queryPromise;
        });
    }

    track(eventName, props) {

        return Promise.all([this.systemInfo, this.networkType, this.currentUser]).then((x) => {
            const [systemInfo, networkType] = x;
            const qBody = {
                event: eventName,
                data: { ...(props || {}), systemInfo, networkType, scene: this.showParam.scene, showParam: this.showParam }
            }

            return this.simpleApiCall('POST', '/ev-collect', { body: qBody });
        });
    }
    //推送消息

    collectTplMessageQuotaByForm(formId, otherOptions) {
        // Real formIds were not likely to contain spaces.
        if (formId.indexOf(' ') >= 0) {
            console.log('Ignoring mocked formId');
            return;
        }
        const queryBody = _.merge({ formId: formId, type: 'form' }, otherOptions || {});

        return this.currentUser.then(() => {
            const queryPromise = this.simpleApiCall('POST', '/my/tplMsgQuota', {
                body: queryBody
            });

            return queryPromise;
        });
    }

    downloadMyAvatar() {
        return this.userInfo.then(() => {
            return this.simpleApiDownload('/my/avatar')
        });
    }

    downloadWxaCode(width, page, scene, color, hyaline) {
        return this.userInfo.then(() => {
            return this.simpleApiDownload('/wxaCodeImage', {
                query: {
                    path: page,
                    width: width,
                    scene: scene,
                    color: color,
                    isHyaline: hyaline
                }
            })
        });
    }
}