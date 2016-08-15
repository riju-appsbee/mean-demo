(function() {
    'use strict';
    angular.module('FoodjetsApp').controller('ItemController', ['$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        '$window',
        '$compile',
        '$state',
        'Globalutc',
        'itemResource',
        'math',
        'RTFoodJets',
        function($rootScope,
            $scope,
            $http,
            $stateParams,
            $location,
            $timeout,
            $window,
            $compile,
            $state,
            Globalutc,
            itemResource,
            math,
            RTFoodJets) {
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.loaderValue = true;
            $scope.choices = [];
            $scope.items = {};
            $scope.menu_id = null;
            $scope.menu_name = '';
            $scope.hiddenChoiceIndex = null;
            $scope.hiddenOptionIndex = null;
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';
            $scope.noImagePath = 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image';
            $scope.periodTags = [];
            $scope.categoryTags = [];
            $scope.choiceSubmitMode = 'insert';
            $scope.optionSubmitMode = 'insert';

            //console.log(moment.utc().format('HH:mm'));//11:00
            // console.log(moment.utc().unix());//1464865258 (seconds)

            // Pagination setup start
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.itemList();
            };
            // Pagination setup end

            // Count total items
            $scope.itemCount = function() {
                $scope.menu_id = $stateParams.id;

                firebase.database().ref('menu_item/' + $scope.menu_id).on('value', function(snapshot) {
                    $scope.totalItems = snapshot.numChildren();
                    $scope.itemList($scope.menu_id);
                }, function(error) {
                    console.log(error);
                    $scope.toastrError('Sorry!Can not count items.', {});
                    $location.path('/ng/dashboard');
                    if (!$scope.$$phase) $scope.$apply();
                });

            };

            //Fetch list of items
            $scope.itemList = function(menuID) {

                firebase.database().ref('menu_item/' + menuID).on('value', function(snapshot) {
                    var response = [];
                    // console.log(snapshot.val());
                    angular.forEach(snapshot.val(), function(value, key) {
                        value.id = key;
                        response.push(value);
                    });
                    $scope.items = response;
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(error) {
                    console.log(error);
                    $scope.loaderValue = false;
                    $scope.toastrError('Sorry!Can not list menus.', {});
                    $location.path('/ng/dashboard');
                    if (!$scope.$$phase) $scope.$apply();
                });


                /*
                itemResource.get({ 'method': 'list', 'id': menuID, 'p': $scope.currentPage }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        angular.forEach(response.result, function(value, key) {
                            response.result[key].created_date = value.created_date.split('T')[0];
                        });
                        $scope.items = response.result;
                    }
                });
                */
            };

            //Add a new item
            $scope.addItem = function($valid) {
                $scope.checkValidation = function(callback) {
                    $scope.menu_id = $stateParams.id;
                    if ($scope.menu_id && $valid) {
                        var requestObject = {
                            'name': $scope.params.name,
                            // 'wholesale_price': math.round($scope.params.wholesale_price),
                            'retail_price': math.round($scope.params.retail_price),
                            // 'commission': math.round($scope.params.commission),
                            'choices': {},
                            'image': '',
                            'description': ($scope.params.description === undefined || $scope.params.description === null || $scope.params.description === '') ? '' : $scope.params.description,
                            'active': $scope.params.active,
                            'itm_prep_time': ($scope.params.itm_prep_time) ? $scope.params.itm_prep_time : 0,
                            'soldout_expiry': ($scope.params.soldout_exp_time_item === undefined || $scope.params.soldout_exp_time_item === null || $scope.params.soldout_exp_time_item === '' || $scope.params.soldout_exp_time_item == 0) ? 0 : moment($scope.params.soldout_exp_time_item,"M-D-YYYY").unix(),
                            'created_date': Globalutc.now(),
                            'modified_date': Globalutc.now()
                        };
                        var meal_periods = {};
                        angular.forEach($scope.params.meal_period, function(value, key) {
                            meal_periods[value.text] = true;
                        });
                        requestObject.meal_period = meal_periods;
                        var menu_category = {};
                        angular.forEach($scope.params.menu_category, function(value, key) {
                            menu_category[value.text] = true;
                        });
                        requestObject.menu_category = menu_category;
                        callback(null, $scope.menu_id, requestObject);
                    } else {
                        callback('Invalid data!', null);
                    }
                };

                $scope.addItem = function(menuID, requestObject, callback) {
                    firebase.database().ref('menu_item/' + menuID).push(requestObject).then(function(data) {
                        var itemID = data.key;
                        callback(null, menuID, requestObject, itemID);
                    }).catch(function(error) {
                        console.log(error);
                        callback('Sorry!Can not add the item.', null);
                    });
                };

                $scope.addItemImage = function(menuID, requestObject, itemID, callback) {
                    if ($scope.params.image != undefined && $scope.params.image != '') {
                        itemResource.save({
                            'jsonrpc': '2.0',
                            'method': 'add',
                            'id': menuID,
                            'params': $scope.params
                        }, function(response) {
                            if (response.error) {
                                callback(response.error.message, null);
                            } else {
                                firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/image/').set(response.result).then(function() {
                                    callback(null, menuID, requestObject, itemID);
                                }).catch(function(error) {
                                    console.log(error);
                                    callback('Sorry!Can not add the image.', null);
                                });
                            }
                        });
                    } else {
                        callback(null, menuID, requestObject, itemID);
                    }
                };

                $scope.addChoicesAndOptions = function(menuID, requestObject, itemID, callback) {
                    //If choices exists
                    if ($scope.choices.length > 0) {
                        angular.forEach($scope.choices, function(choice) {
                            //adding choices start
                            firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/choices/').push({ 'title': choice.title, 'required': choice.required, 'active': choice.active, 'select': choice.select, options: {} }).then(function(snapshot) {
                                // console.log('successfully added choice');
                                angular.forEach(choice.options, function(option) {
                                    //adding options start
                                    firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/choices/' + snapshot.key + '/options/').push({
                                        'name': option.name,
                                        'wholesale_price': math.round(option.wholesale_price),
                                        'retail_price': math.round(option.retail_price),
                                        'active': option.active,
                                        'soldout_expiry': (option.soldout_expiry === undefined || option.soldout_expiry === null || option.soldout_expiry === '') ? '' : moment(option.soldout_expiry,"M-D-YYYY").unix()
                                    }).then(function() {}).catch(function(error) {
                                        console.log(error);
                                        callback('Sorry!Can not add the option.', null);
                                    });
                                    //adding options end
                                });
                            }).catch(function(error) {
                                $scope.choiceFlag = false;
                                console.log(error);
                                callback('Sorry!Can not add the choice.', null);
                            });
                            //adding choices ends
                        });
                        callback(null, 'success');
                    } else {
                        callback(null, 'success');
                    }
                };
                async.waterfall([$scope.checkValidation, $scope.addItem, $scope.addItemImage, $scope.addChoicesAndOptions], function(err, result) {
                    if (err !== null) {
                        $scope.toastrError(err, {});
                    } else {
                        $scope.toastrSuccess('You have successfully added an item.', {});
                        $location.path('/ng/menu/edit/' + $scope.menu_id);
                        if (!$scope.$$phase) $scope.$apply();
                    }
                });

            };

            $scope.addChoice = function(choiceForm) {
                // console.log($valid);
                if (choiceForm.$valid) {
                    if($scope.choiceSubmitMode === 'insert'){
                        $scope.choices.push({
                            'title': $scope.params.title,
                            'active': $scope.params.choice_active,
                            'required': $scope.params.required,
                            'select': $scope.params.select,
                            'options': []
                        });
                    }
                    if ($scope.choiceSubmitMode === 'update') {
                        //console.log($scope.hiddenChoiceIndex);
                        $scope.choices[$scope.hiddenChoiceIndex].title = $scope.params.title;
                        $scope.choices[$scope.hiddenChoiceIndex].active = $scope.params.choice_active;
                        $scope.choices[$scope.hiddenChoiceIndex].required = $scope.params.required;
                        $scope.choices[$scope.hiddenChoiceIndex].select = $scope.params.select;
                    }
                    $scope.params.title = '';
                    $scope.params.required = true;
                    $scope.params.select = '';
                    $scope.params.choice_active = true;
                    choiceForm.$setPristine();
                    choiceForm.$setUntouched();
                }


            };

            $scope.updateChoiceIndex = function(id) {
                // console.log(id);
                $scope.hiddenChoiceIndex = id;
                $scope.optionSubmitMode = 'insert';
            };

            $scope.addOption = function(optionForm) {
                // console.log($scope.choices);return;
                if (optionForm.$valid) {
                    var choice_index = $scope.hiddenChoiceIndex;
                    if($scope.optionSubmitMode === 'insert'){
                        $scope.choices[choice_index].options.push({
                            'name': $scope.params.option_name,
                            'wholesale_price': $scope.params.wholesale_price_option,
                            'retail_price': $scope.params.retail_price_option,
                            'active': $scope.params.option_active,
                            'soldout_expiry': $scope.params.soldout_exp_time_option
                        });
                    }
                    if($scope.optionSubmitMode === 'update'){
                        var option_index = $scope.hiddenOptionIndex;
                        $scope.choices[choice_index].options[option_index].name = $scope.params.option_name;
                        $scope.choices[choice_index].options[option_index].wholesale_price = $scope.params.wholesale_price_option;
                        $scope.choices[choice_index].options[option_index].retail_price = $scope.params.retail_price_option;
                        $scope.choices[choice_index].options[option_index].active = $scope.params.option_active;
                        $scope.choices[choice_index].options[option_index].soldout_expiry = $scope.params.soldout_exp_time_option;
                    }
                    $scope.params.option_name = '';
                    $scope.params.wholesale_price_option = '';
                    $scope.params.retail_price_option = '';
                    $scope.params.option_active = true;
                    // $scope.params.sold_out_option = true;
                    $scope.params.soldout_exp_time_option = '';
                    optionForm.$setPristine();
                    optionForm.$setUntouched();
                    // console.log($scope.choices);
                }

            };

            $scope.removeChoice = function(index) {
                $scope.choices.splice(index, 1);
            };
            $scope.removeOption = function(choiceID, optionID) {
                $scope.choices[choiceID].options.splice(optionID, 1);
            };

            $scope.clearChoiceForm = function(choiceForm) {
                $scope.params.title = '';
                $scope.params.required = true;
                $scope.params.select = '';
                $scope.params.choice_active = true;
                choiceForm.$setPristine();
                choiceForm.$setUntouched();
            };
            $scope.clearOptionForm = function(optionForm) {
                $scope.params.option_name = '';
                $scope.params.wholesale_price_option = '';
                $scope.params.retail_price_option = '';
                $scope.params.option_active = true;
                // $scope.params.sold_out_option = true;
                $scope.params.soldout_exp_time_option = '';
                optionForm.$setPristine();
                optionForm.$setUntouched();
            };




            //Fetch details of a item by ID before updation
            $scope.getItemInfo = function() {
                $scope.params = {};
                var itemID = $stateParams.id;
                var menuID = $stateParams.menu_id;
                $scope.menu_id = menuID;
                if (itemID) {

                    firebase.database().ref('menu_item/' + menuID + '/' + itemID).once('value').then(function(snapshot) {
                        $scope.params.id = snapshot.key;
                        $scope.params.name = snapshot.val().name;
                        if (snapshot.val().image != undefined && snapshot.val().image != null && snapshot.val().image != '') {
                            $scope.params.image = snapshot.val().image;
                            $scope.params.imagePath = $scope.cloud_url + snapshot.val().image;
                        }
                        // $scope.params.wholesale_price = math.round(snapshot.val().wholesale_price).toFixed(2);
                        $scope.params.retail_price = math.round(snapshot.val().retail_price).toFixed(2);
                        // $scope.params.commission = math.round(snapshot.val().commission).toFixed(2);
                        // $scope.params.itm_prep_time = snapshot.val().itm_prep_time;
                        $scope.params.itm_prep_time = (snapshot.val().itm_prep_time) ? snapshot.val().itm_prep_time : '';
                        $scope.params.description = snapshot.val().description;
                        var meal_periods = [];
                        angular.forEach(snapshot.val().meal_period, function(value, key) {
                            meal_periods.push(key);
                        });
                        var menu_category = [];
                        angular.forEach(snapshot.val().menu_category, function(value, key) {
                            menu_category.push(key);
                        });
                        $scope.params.meal_period = meal_periods;
                        $scope.params.menu_category = menu_category;
                        if (snapshot.val().soldout_expiry !== undefined && snapshot.val().soldout_expiry !== '' && snapshot.val().soldout_expiry !== null && snapshot.val().soldout_expiry !== 0) {
                            $scope.params.soldout_exp_time_item = moment.unix(snapshot.val().soldout_expiry).format('MM-DD-YYYY');
                            // console.log(snapshot.val().soldout_expiry);
                        } else {
                            $scope.params.soldout_exp_time_item = '';
                        }
                        $scope.params.active = (snapshot.val().active === true) ? true : false;
                        //If choices exists
                        if (typeof snapshot.val().choices == 'object' && Object.keys(snapshot.val().choices).length > 0) {
                            var choicesArray = [];
                            var index = 0;
                            angular.forEach(snapshot.val().choices, function(choice) {
                                choicesArray.push({ 'active': choice.active, 'required': choice.required, 'select': choice.select, 'title': choice.title, 'options': [] });
                                if (typeof choice.options == 'object' && Object.keys(choice.options).length > 0) {
                                    angular.forEach(choice.options, function(option) {
                                        var soldOutExpOption = '';
                                        if (option.soldout_expiry !== undefined && option.soldout_expiry !== '' && option.soldout_expiry !== null) {
                                            soldOutExpOption = moment.unix(option.soldout_expiry).format('MM-DD-YYYY');
                                        }
                                        choicesArray[index].options.push({ 'active': option.active, 'name': option.name, 'retail_price': option.retail_price, 'wholesale_price': option.wholesale_price, 'soldout_expiry': soldOutExpOption });
                                    });
                                }
                                index++;
                            });
                            $scope.choices = choicesArray;
                        }

                        // console.log($scope.params);
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError('Sorry!Some error occured!', {});
                        $location.path('/ng/menu/edit/'+$scope.menu_id);
                        if (!$scope.$$phase) $scope.$apply();
                    });

                } else {
                    $scope.toastrError('Unauthorized access!', {});
                    $location.path('/ng/item/list/' + $stateParams.menu_id);
                }
            };

            //Populate choice details while editing a choice on the fly
            $scope.editChoice = function(choiceIndex) {

                if (choiceIndex!='' || choiceIndex !=undefined || choiceIndex !==null) {
                    $scope.params.title = $scope.choices[choiceIndex].title;
                    $scope.params.select = $scope.choices[choiceIndex].select;
                    $scope.params.required = ($scope.choices[choiceIndex].required === true) ? true : false;
                    $scope.params.choice_active = ($scope.choices[choiceIndex].active === true) ? true : false;
                    $scope.choiceSubmitMode = 'update';
                    $scope.hiddenChoiceIndex = choiceIndex;
                }

            };

            //Populate option details while editing an option on the fly
            $scope.editOption = function(choiceIndex,optionIndex) {

                if (choiceIndex!='' || choiceIndex !=undefined || choiceIndex !==null || optionIndex!='' || optionIndex !=undefined || optionIndex !==null) {
                    $scope.params.option_name = $scope.choices[choiceIndex].options[optionIndex].name;
                    $scope.params.wholesale_price_option = math.round($scope.choices[choiceIndex].options[optionIndex].wholesale_price).toFixed(2);
                    $scope.params.retail_price_option = math.round($scope.choices[choiceIndex].options[optionIndex].retail_price).toFixed(2);
                    $scope.params.soldout_exp_time_option = $scope.choices[choiceIndex].options[optionIndex].soldout_expiry;

                    $scope.params.option_active = ($scope.choices[choiceIndex].options[optionIndex].active === true) ? true : false;
                    $scope.optionSubmitMode = 'update';
                    $scope.hiddenChoiceIndex = choiceIndex;
                    $scope.hiddenOptionIndex = optionIndex;
                }

            };

            //Update details of the item if everything is okay
            $scope.updateItem = function($valid) {
                // console.log($scope.params);
                $scope.checkValidation = function(callback) {
                    if ($valid) {
                        // console.log($scope.params.soldout_exp_time_item.toString());
                        // console.log(moment('07-21-2016').unix());
                        // console.log(moment("07-21-2016", "M-D-YYYY").unix());

                        // return;
                        var requestObject = {
                            'name': $scope.params.name,
                            // 'wholesale_price': math.round($scope.params.wholesale_price),
                            'retail_price': math.round($scope.params.retail_price),
                            // 'commission': math.round($scope.params.commission),
                            'choices': {},
                            'image': '',
                            'description': ($scope.params.description === undefined || $scope.params.description === null || $scope.params.description === '') ? '' : $scope.params.description,
                            'itm_prep_time': ($scope.params.itm_prep_time === undefined || $scope.params.itm_prep_time === null || $scope.params.itm_prep_time === '') ? 0 : $scope.params.itm_prep_time,
                            'active': $scope.params.active,
                            'soldout_expiry': ($scope.params.soldout_exp_time_item === undefined || $scope.params.soldout_exp_time_item === null || $scope.params.soldout_exp_time_item === '' || $scope.params.soldout_exp_time_item == 0) ? 0 : moment($scope.params.soldout_exp_time_item,"M-D-YYYY").unix(),
                            'modified_date': Globalutc.now()
                        };
                        var meal_periods = {};
                        angular.forEach($scope.params.meal_period, function(value, key) {
                            meal_periods[value.text] = true;
                        });
                        requestObject.meal_period = meal_periods;
                        var menu_category = {};
                        angular.forEach($scope.params.menu_category, function(value, key) {
                            menu_category[value.text] = true;
                        });
                        requestObject.menu_category = menu_category;
                        if ($scope.params.image !== undefined && $scope.params.image !== '') {
                            requestObject.image = $scope.params.image;
                        }
                        callback(null, $stateParams.menu_id, requestObject);
                    } else {
                        callback('Invalid data!', null);
                    }
                };

                $scope.updateItem = function(menuID, requestObject, callback) {
                    // console.log(requestObject);
                    var itemID = $scope.params.id;
                    firebase.database().ref('menu_item/' + menuID + '/' + itemID).update(requestObject).then(function() {
                        callback(null, menuID, requestObject, itemID);
                    }).catch(function(error) {
                        console.log(error);
                        callback('Sorry!Could not update data.', null);
                    });
                };

                $scope.upadteItemImage = function(menuID, requestObject, itemID, callback) {
                    if ($scope.params.image !== undefined && $scope.params.image !== '' && $scope.params.image.indexOf("base64") !== -1) {
                        itemResource.save({
                            'jsonrpc': '2.0',
                            'method': 'add',
                            'id': menuID,
                            'params': $scope.params
                        }, function(response) {
                            if (response.error) {
                                callback(response.error.message, null);
                            } else {
                                firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/image/').set(response.result).then(function() {
                                    callback(null, menuID, requestObject, itemID);
                                }).catch(function(error) {
                                    console.log(error);
                                    callback('Sorry!Can not add the image.', null);
                                });
                            }
                        });
                    } else {
                        callback(null, menuID, requestObject, itemID);
                    }
                };

                $scope.updateChoicesAndOptions = function(menuID, requestObject, itemID, callback) {
                    //If choices exists
                    if ($scope.choices.length > 0) {
                        angular.forEach($scope.choices, function(choice) {
                            firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/choices/').remove(function(error) {
                                if (error) {
                                    console.log(error);
                                    callback('Sorry!Can not update the choice.', null);
                                } else {
                                    //adding choices start
                                    firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/choices/').push({ 'title': choice.title, 'required': choice.required, 'active': choice.active, 'select': choice.select, options: {} }).then(function(snapshot) {
                                        // console.log('successfully added choice');
                                        angular.forEach(choice.options, function(option) {
                                            //adding options start
                                            firebase.database().ref('menu_item/' + menuID + '/' + itemID + '/choices/' + snapshot.key + '/options/').push({
                                                'name': option.name,
                                                'wholesale_price': math.round(option.wholesale_price),
                                                'retail_price': math.round(option.retail_price),
                                                'active': option.active,
                                                'soldout_expiry': (option.soldout_expiry === undefined || option.soldout_expiry === null || option.soldout_expiry === '') ? '' : moment(option.soldout_expiry,"M-D-YYYY").unix()
                                            }).then(function() {}).catch(function(error) {
                                                console.log(error);
                                                callback('Sorry!Can not add the option.', null);
                                            });
                                            //adding options end
                                        });
                                    }).catch(function(error) {
                                        console.log(error);
                                        callback('Sorry!Can not add the choice.', null);
                                    });
                                    //adding choices ends
                                }
                            });
                        });
                        callback(null, 'success');
                    } else {
                        callback(null, 'success');
                    }
                };

                async.waterfall([$scope.checkValidation, $scope.updateItem, $scope.upadteItemImage, $scope.updateChoicesAndOptions], function(err, result) {
                    if (err !== null) {
                        console.log(err);
                        $scope.toastrError(err, {});
                    } else {
                        $scope.toastrSuccess('You have successfully updated the item.', {});
                        $location.path('/ng/menu/edit/' + $stateParams.menu_id);
                        if (!$scope.$$phase) $scope.$apply();
                    }
                });



            };

            //delete item by ID
            $scope.deleteItem = function(itemID) {
                if (window.confirm('Do you really want to delete this item?')) {
                    firebase.database().ref('menu_item/' + $scope.menu_id + '/' + itemID).remove(function(error) {
                        if (error) {
                            $scope.toastrError('Item can not be deleted.', {});
                        } else {
                            // $scope.init();
                            $scope.toastrSuccess('You have successfully deleted the item.', {});
                        }
                    });
                }
            };
            //Clear image while admin clicks remove button
            $scope.clearImage = function() {
                $scope.params.image = '';
                $scope.params.imagePath = '';
                angular.element('.fileinput-preview img').attr('src', $scope.noImagePath);

            };




            //Load tags to autocomplete meal-period field
            $scope.loadPeriodTags = function(query) {
                return $scope.periodTags;
            };
            //Load tags to autocomplete category field
            $scope.loadCategoryTags = function(query) {
                return $scope.categoryTags;
            };

            $scope.fetchCategoryAndMealPeriod = function() {
                firebase.database().ref('menu/' + $scope.menu_id).once('value').then(function(snapshot) {
                    $scope.menu_name = snapshot.val().title;
                    if (typeof snapshot.val().meal_period == 'object' && Object.keys(snapshot.val().meal_period).length > 0) {
                        var meal_periods = [];
                        angular.forEach(snapshot.val().meal_period, function(value, key) {
                            meal_periods.push({ 'text': key });
                        });
                        $scope.periodTags = meal_periods;
                    }
                    if (typeof snapshot.val().menu_category == 'object' && Object.keys(snapshot.val().menu_category).length > 0) {
                        var menu_category = [];
                        angular.forEach(snapshot.val().menu_category, function(value, key) {
                            menu_category.push({ 'text': key });
                        });
                        $scope.categoryTags = menu_category;
                    }
                    if (!$scope.$$phase) $scope.$apply();
                }).catch(function(error) {
                    console.log(error);
                });
            };

            $scope.updateChoiceSubmitMode = function(){
                $scope.choiceSubmitMode = 'insert';
            };

            //Reset item form by button click
            $scope.resetItemForm = function() {
                $scope.params.name = '';
                $scope.params.wholesale_price = '';
                $scope.params.retail_price = '';
                $scope.params.commission = '';
                $scope.params.description = '';
                $scope.params.soldout_exp_time_item = '';
                $scope.params.meal_period = [];
                $scope.params.menu_category = [];
                $scope.clearImage();
                $scope.itemForm.$setPristine();
                $scope.itemForm.$setUntouched();
                // console.log($scope.params);

            };

            //Initializing controller functions
            $scope.init = function() {
                var stateInit = {
                    'ng.item.list': function() {
                        $scope.itemCount();
                        $scope.fetchCategoryAndMealPeriod();
                    },
                    'ng.item.edit': function() {
                        $scope.getItemInfo();
                        $scope.fetchCategoryAndMealPeriod();
                    },
                    'ng.item.add': function() {
                        $scope.menu_id = $stateParams.id;
                        $scope.fetchCategoryAndMealPeriod();
                    }
                };

                if (stateInit[$state.$current.name] !== undefined) {
                    stateInit[$state.$current.name]();
                }


            };
            $scope.init();

        }
    ]);
})();
