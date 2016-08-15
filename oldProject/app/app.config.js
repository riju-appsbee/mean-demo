(function() {
    'use strict';

    angular.module('FoodjetsApp').config(
        ['$ocLazyLoadProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider', '$httpProvider',
            function($ocLazyLoadProvider, $locationProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

                // ocLazyLoad
                $ocLazyLoadProvider.config({
                    // global configs go here
                });

                // html5Mode activate
                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false
                });

                //Interceptor to add authorisation in header
                $httpProvider.interceptors.push('Interceptor');

                // Redirect any unmatched url
                $urlRouterProvider.otherwise('/login');

                //Login navigation starts
                $stateProvider
                    .state('login', {
                        url: '/login',
                        templateUrl: 'app/auth/login.html',
                        data: {
                            pageTitle: 'Admin login'
                        },
                        controller: 'LoginController',
                        authenticate: false,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/pages/css/login-5.min.css',
                                        'assets/global/plugins/select2/js/select2.full.min.js',
                                        'assets/global/plugins/backstretch/jquery.backstretch.min.js',
                                        //'assets/layouts/layout/css/themes/darkblue.min.css',
                                        'app/auth/auth.directives.js',
                                        'app/auth/login.controller.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng', {
                        url: '/ng',
                        abstract: true,
                        templateUrl: 'app/tpl/app.html',
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/css/components.min.css',
                                        'assets/global/css/plugins.min.css',
                                        'assets/layouts/layout/css/layout.min.css',
                                        'assets/layouts/layout/css/themes/darkblue.min.css',
                                        'assets/layouts/layout/css/custom.min.css',
                                    ]
                                });
                            }]
                        }
                    })

                //Dashboard navigation starts
                .state('ng.dashboard', {
                    url: '/dashboard',
                    templateUrl: 'app/dashboard/dashboard.html',
                    data: {
                        pageTitle: 'Admin Dashboard'
                    },
                    controller: 'DashboardController',
                    authenticate: true,
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'FoodjetsApp',
                                insertBefore: '#ng_load_plugins_before',
                                files: [
                                    'app/dashboard/dashboard.controller.js',
                                ]
                            });
                        }]
                    }
                })

                //Driver navigation starts
                .state('ng.driver', {
                    url: '/driver',
                    abstract: true,
                    template: '<ui-view/>'
                })

                .state('ng.driver.list', {
                        url: '/list',
                        templateUrl: 'app/driver/driver.html',
                        data: {
                            pageTitle: 'Driver List'
                        },
                        controller: 'DriverController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/driver/driver.controller.js',
                                        'app/driver/driver.services.js',
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.driver.add', {
                        url: '/add',
                        templateUrl: 'app/driver/add.html',
                        data: {
                            pageTitle: 'Add Driver'
                        },
                        controller: 'DriverController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/css/intlTelInput.css',
                                        'assets/global/plugins/angularjs/intlTelInput.js',
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/driver/driver.controller.js',
                                        'app/driver/driver.services.js',
                                        'app/driver/driver.directives.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.driver.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/driver/edit.html',
                        data: {
                            pageTitle: 'Edit Driver'
                        },
                        controller: 'DriverController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/css/intlTelInput.css',
                                        'assets/global/plugins/angularjs/intlTelInput.js',
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/driver/driver.controller.js',
                                        'app/driver/driver.services.js',
                                        'app/driver/driver.directives.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js',

                                    ]
                                });
                            }]
                        }
                    })

                //Order navigation starts
                .state('ng.order', {
                    url: '/order',
                    abstract: true,
                    template: '<ui-view/>'
                }).state('ng.order.list', {
                    url: '/list',
                    templateUrl: 'app/order/order.html',
                    data: {
                        pageTitle: 'Order List'
                    },
                    controller: 'OrderController',
                    authenticate: true,
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'FoodjetsApp',
                                insertBefore: '#ng_load_plugins_before',
                                files: [
                                    'app/order/order.controller.js',
                                    'app/order/order.services.js',
                                ]
                            });
                        }]
                    }
                }).state('ng.order.details', {
                    url: '/details/:orderNumber',
                    templateUrl: 'app/order/details.html',
                    data: {
                        pageTitle: 'Order Details'
                    },
                    controller: 'OrderController',
                    authenticate: true,
                    resolve: {
                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'FoodjetsApp',
                                insertBefore: '#ng_load_plugins_before',
                                files: [
                                    'assets/pages/css/invoice.min.css',
                                    'assets/apps/css/customer-order.css',
                                    'app/order/order.controller.js',
                                    'app/order/order.services.js',
                                ]
                            });
                        }]
                    }
                })

                //Customer navigation starts
                .state('ng.customer', {
                    url: '/customer',
                    abstract: true,
                    template: '<ui-view/>'
                })

                .state('ng.customer.list', {
                        url: '/list',
                        templateUrl: 'app/customer/customer.html',
                        data: {
                            pageTitle: 'Customer List'
                        },
                        controller: 'CustomerController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/customer/customer.controller.js',
                                        'app/customer/customer.services.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.customer.add', {
                        url: '/add',
                        templateUrl: 'app/customer/add.html',
                        data: {
                            pageTitle: 'Add Customer'
                        },
                        controller: 'CustomerController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/css/intlTelInput.css',
                                        'assets/global/plugins/angularjs/intlTelInput.js',
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'app/customer/customer.controller.js',
                                        'app/customer/customer.services.js',
                                        'app/customer/customer.directives.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.customer.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/customer/edit.html',
                        data: {
                            pageTitle: 'Edit Customer'
                        },
                        controller: 'CustomerController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/css/intlTelInput.css',
                                        'assets/global/plugins/angularjs/intlTelInput.js',
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'app/customer/customer.controller.js',
                                        'app/customer/customer.services.js',
                                        'app/customer/customer.directives.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })

                //Employee navigation starts
                .state('ng.employee', {
                        url: '/employee',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.employee.listing', {
                        url: '/list',
                        templateUrl: 'app/employee/listing.html',
                        data: {
                            pageTitle: 'Admin Employee Listing'
                        },
                        controller: 'EmployeeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/employee/employee.controller.js',
                                        'app/employee/employee.services.js',
                                        'app/employee/employee.directives.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.employee.add', {
                        url: '/add',
                        templateUrl: 'app/employee/add.html',
                        data: {
                            pageTitle: 'Admin Employee Add'
                        },
                        controller: 'EmployeeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/employee/employee.controller.js',
                                        'app/employee/employee.services.js',
                                        'app/employee/employee.directives.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.employee.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/employee/edit.html',
                        data: {
                            pageTitle: 'Admin Employee Edit'
                        },
                        controller: 'EmployeeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/employee/employee.controller.js',
                                        'app/employee/employee.services.js',
                                        'app/employee/employee.directives.js',
                                    ]
                                });
                            }]
                        }

                    })

                //Promo code navigation starts
                .state('ng.promo', {
                        url: '/promo',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.promo.list', {
                        url: '/list',
                        templateUrl: 'app/promotion/promo/promo.html',
                        data: {
                            pageTitle: 'Promo List'
                        },
                        controller: 'PromoController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/promotion/promo/promo.services.js',
                                        'app/promotion/promo/promo.controller.js',

                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.promo.add', {
                        url: '/add',
                        templateUrl: 'app/promotion/promo/add.html',
                        data: {
                            pageTitle: 'Promo Add'
                        },
                        controller: 'PromoController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/promotion/promo/promo.services.js',
                                        'app/promotion/promo/promo.controller.js',
                                        'app/promotion/promo/promo.directives.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.promo.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/promotion/promo/edit.html',
                        data: {
                            pageTitle: 'Promo Edit'
                        },
                        controller: 'PromoController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/promotion/promo/promo.services.js',
                                        'app/promotion/promo/promo.controller.js',
                                        'app/promotion/promo/promo.directives.js',
                                    ]
                                });
                            }]
                        }
                    })

                //Restaurant navigation starts
                .state('ng.restaurant', {
                        url: '/restaurant',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.restaurant.list', {
                        url: '/list',
                        templateUrl: 'app/restaurant/restaurant.html',
                        data: {
                            pageTitle: 'Restaurant List'
                        },
                        controller: 'RestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                        'app/restaurant/restaurant_search.services.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.restaurant.add', {
                        url: '/add',
                        templateUrl: 'app/restaurant/add.html',
                        data: {
                            pageTitle: 'Add Restaurant'
                        },
                        controller: 'RestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                        'app/restaurant/restaurant_search.services.js',
                                        'app/restaurant/restaurant.directives.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.restaurant.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/restaurant/edit.html',
                        data: {
                            pageTitle: 'Edit Restaurant'
                        },
                        controller: 'RestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                        'app/restaurant/restaurant_search.services.js',
                                        'app/restaurant/restaurant.directives.js',
                                        'assets/global/plugins/ladda/ladda-themeless.min.css',
                                        'assets/global/plugins/ladda/spin.min.js',
                                        'assets/global/plugins/ladda/ladda.min.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.restaurant.globalsearch', {
                        url: '/global-search',
                        templateUrl: 'app/restaurant/restaurant_global_search.html',
                        data: {
                            pageTitle: 'Restaurant Global Search'
                        },
                        controller: 'RestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                        'app/restaurant/restaurant_search.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.restaurant.view-contact-info', {
                        url: '/view-contact-info/:id',
                        templateUrl: 'app/restaurant/view_contact.html',
                        data: {
                            pageTitle: 'View Restaurant Contacts'
                        },
                        controller: 'RestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                        'app/restaurant/restaurant_search.services.js',
                                        'app/restaurant/restaurant.directives.js',
                                    ]
                                });
                            }]
                        }
                    })

                //Gift code navigation starts
                .state('ng.gift', {
                        url: '/gift',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.gift.list', {
                        url: '/list',
                        templateUrl: 'app/promotion/gift/list.html',
                        data: {
                            pageTitle: 'Gift List'
                        },
                        controller: 'GiftController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/promotion/gift/gift.controller.js',
                                        'app/promotion/gift/gift.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.gift.add', {
                        url: '/add',
                        templateUrl: 'app/promotion/gift/add.html',
                        data: {
                            pageTitle: 'Add Gift'
                        },
                        controller: 'GiftController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/promotion/gift/gift.controller.js',
                                        'app/promotion/gift/gift.services.js',
                                        'app/promotion/gift/gift.directives.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.gift.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/promotion/gift/edit.html',
                        data: {
                            pageTitle: 'Gift Edit'
                        },
                        controller: 'GiftController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/promotion/gift/gift.controller.js',
                                        'app/promotion/gift/gift.services.js',
                                        'app/promotion/gift/gift.directives.js',
                                    ]
                                });
                            }]
                        }
                    })
                    //Menu navigation starts
                    .state('ng.menu', {
                        url: '/menu',
                        abstract: true,
                        template: '<ui-view/>'
                    })

                .state('ng.menu.list', {
                        url: '/list',
                        templateUrl: 'app/menu/menu.html',
                        data: {
                            pageTitle: 'Menu List'
                        },
                        controller: 'MenuController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/menu/menu.controller.js',
                                        'app/menu/menu.services.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.menu.add', {
                        url: '/add',
                        templateUrl: 'app/menu/add.html',
                        data: {
                            pageTitle: 'Add Menu'
                        },
                        controller: 'MenuController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/menu/menu.controller.js',
                                        'app/menu/menu.services.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.menu.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/menu/edit.html',
                        data: {
                            pageTitle: 'Edit Menu'
                        },
                        controller: 'MenuController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/menu/menu.controller.js',
                                        'app/menu/menu.services.js'

                                    ]
                                });
                            }]
                        }
                    })
                    //Menu navigation ends
                    //Item navigation starts
                    .state('ng.item', {
                        url: '/item',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.item.add', {
                        url: '/add/:id',
                        templateUrl: 'app/item/add.html',
                        data: {
                            pageTitle: 'Add Item'
                        },
                        controller: 'ItemController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/item/item.controller.js',
                                        'app/item/item.services.js',
                                        'app/item/item.directives.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.item.edit', {
                        url: '/edit/:id/:menu_id',
                        templateUrl: 'app/item/edit.html',
                        data: {
                            pageTitle: 'Edit Item'
                        },
                        controller: 'ItemController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'assets/pages/css/profile.min.css',
                                        'app/item/item.controller.js',
                                        'app/item/item.services.js',
                                        'app/item/item.directives.js'
                                    ]
                                });
                            }]
                        }
                    })
                    //Market-office navigation starts
                    .state('ng.market-office', {
                        url: '/market-office',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.market-office.list', {
                        url: '/list/:state?',
                        templateUrl: 'app/market_office/list.html',
                        data: {
                            pageTitle: 'Market Office List'
                        },
                        controller: 'MarketOfficeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/market_office/market_office.services.js',
                                        'app/market_office/market_office.controller.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',

                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-office.add', {
                        url: '/add',
                        templateUrl: 'app/market_office/add.html',
                        data: {
                            pageTitle: 'Market Office Add'
                        },
                        controller: 'MarketOfficeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/market_office.services.js',
                                        'app/market_office/market_office.controller.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-office.edit', {
                        url: '/edit/:state/:id',
                        templateUrl: 'app/market_office/edit.html',
                        data: {
                            pageTitle: 'Market Office Edit'
                        },
                        controller: 'MarketOfficeController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/market_office.services.js',
                                        'app/market_office/market_office.controller.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    //market office city navigation
                    .state('ng.market-office-city', {
                        url: '/market-office-city',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.market-office-city.list', {
                        url: '/list/:state/:mofid',
                        templateUrl: 'app/market_office/city_list.html',
                        data: {
                            pageTitle: 'Market Office City List'
                        },
                        controller: 'MarketOfficeCityController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/market_office_city.controller.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-office-city.add', {
                        url: '/add/:state/:mofid',
                        templateUrl: 'app/market_office/city_add.html',
                        data: {
                            pageTitle: 'Market Office City Add'
                        },
                        controller: 'MarketOfficeCityController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/market_office_city.controller.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-office-city.edit', {
                        url: '/edit/:state/:mofid/:id',
                        templateUrl: 'app/market_office/city_edit.html',
                        data: {
                            pageTitle: 'Market Office City Edit'
                        },
                        controller: 'MarketOfficeCityController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/market_office_city.controller.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    //delivery zone navigation
                    .state('ng.delivery-zone', {
                        url: '/delivery-zone',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.delivery-zone.list', {
                        url: '/list/:state/:mofid/:cityid',
                        templateUrl: 'app/market_office/delivery_zone_list.html',
                        data: {
                            pageTitle: 'Delivery Zone List'
                        },
                        controller: 'DeliveryZoneController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/market_office/delivery_zone.controller.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.delivery-zone.add', {
                        url: '/add/:state/:mofid/:cityid',
                        templateUrl: 'app/market_office/delivery_zone_add.html',
                        data: {
                            pageTitle: 'Delivery Zone Add'
                        },
                        controller: 'DeliveryZoneController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/market_office/delivery_zone.controller.js',
                                        'app/market_office/delivery_zone.directive.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.delivery-zone.edit', {
                        url: '/edit/:state/:mofid/:cityid/:id',
                        templateUrl: 'app/market_office/delivery_zone_edit.html',
                        data: {
                            pageTitle: 'Delivery Zone Edit'
                        },
                        controller: 'DeliveryZoneController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/apps/css/style.css',
                                        'assets/pages/scripts/components-date-time-pickers.min.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/market_office/delivery_zone.controller.js',
                                    ]
                                });
                            }]
                        }
                    })






                //Global settings navigation starts
                .state('ng.settings', {
                        url: '/settings',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.settings.global', {
                        url: '/global',
                        templateUrl: 'app/settings/global/list.html',
                        data: {
                            pageTitle: 'Global Settings'
                        },
                        controller: 'GlobalSettingsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/global/globalsettings.controller.js',
                                        'app/settings/global/globalsettings.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.referral', {
                        url: '/referral',
                        templateUrl: 'app/settings/referral/list.html',
                        data: {
                            pageTitle: 'Referral Settings'
                        },
                        controller: 'ReferralSettingsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/referral/referral.controller.js',
                                        'app/settings/referral/referral.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.twilio', {
                        url: '/twilio',
                        templateUrl: 'app/settings/twilio/settings.html',
                        data: {
                            pageTitle: 'Twilio Settings'
                        },
                        controller: 'TwilioSettingsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/twilio/twiliosettings.controller.js',
                                        'app/settings/twilio/twiliosettings.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.push-notification-setting', {
                        url: '/push-notification-setting',
                        templateUrl: 'app/settings/push_notification/settings.html',
                        data: {
                            pageTitle: 'Push Notification Settings'
                        },
                        controller: 'PushNotificationController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/push_notification/pushnotofication.controller.js',
                                        'app/settings/push_notification/pushnotofication.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.global-push-notification', {
                        url: '/global-push-notification',
                        templateUrl: 'app/settings/push_notification/global_push.html',
                        data: {
                            pageTitle: 'Push Notification Settings'
                        },
                        controller: 'PushNotificationController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/push_notification/pushnotofication.controller.js',
                                        'app/settings/push_notification/pushnotofication.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.office-setup', {
                        url: '/office-setup',
                        templateUrl: 'app/settings/office_setup/list.html',
                        data: {
                            pageTitle: 'Office Setup'
                        },
                        controller: 'OfficeSetupController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/office_setup/officesetup.controller.js',
                                        'app/settings/office_setup/officesetup.services.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.settings.reward-point', {
                        url: '/reward-point',
                        templateUrl: 'app/settings/reward_point/list.html',
                        data: {
                            pageTitle: 'Reward Points'
                        },
                        controller: 'RewardSettingController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/settings/reward_point/reward.controller.js',
                                        'app/settings/reward_point/reward.services.js',
                                    ]
                                });
                            }]
                        }
                    })



                //Todays drivers navigation starts
                .state('ng.today-drivers', {
                        url: '/today-drivers',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.today-drivers.list', {
                        url: '/list/:state?',
                        templateUrl: 'app/today_drivers/list.html',
                        data: {
                            pageTitle: 'Today Drivers List'
                        },
                        controller: 'TodayDriversController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-datepaginator/bootstrap-datepaginator.min.css',
                                        'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                                        'assets/global/plugins/bootstrap-datepaginator/bootstrap-datepaginator.min.js',
                                        'app/today_drivers/today_drivers.directives.js',
                                        'app/today_drivers/today_drivers.services.js',
                                        'app/today_drivers/today_drivers.controller.js'
                                    ]
                                });
                            }]
                        }
                    })




                //Tax table navigation starts
                .state('ng.tax', {
                        url: '/tax',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.tax.list', {
                        url: '/list/:state?',
                        templateUrl: 'app/tax/list.html',
                        data: {
                            pageTitle: 'Tax List'
                        },
                        controller: 'TaxController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/tax/tax.services.js',
                                        'app/tax/tax.controller.js',
                                        'app/tax/tax.directives.js',

                                    ]
                                });
                            }]
                        }
                    })


                //Dynamodb table navigation starts
                .state('ng.dynamo', {
                        url: '/dynamo',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.dynamo.list', {
                        url: '/list',
                        templateUrl: 'app/dynamo/list.html',
                        data: {
                            pageTitle: 'Dynamo Table List'
                        },
                        controller: 'DynamoController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/dynamo/dynamo.services.js',
                                        'app/dynamo/dynamo.controller.js',

                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.dynamo.show-data', {
                        url: '/show-data/:tbl',
                        templateUrl: function(stateParams) {

                            var newUrl = '';
                            if (stateParams.tbl.indexOf('dev_v2_' || 'prod_') > -1) {
                                newUrl = stateParams.tbl.replace("dev_v2_", "");
                            }
                            //return 'app/dynamo/' + stateParams.tbl + '.html';
                            return 'app/dynamo/' + newUrl + '.html';
                        },
                        data: {
                            pageTitle: 'Dynamo Data'
                        },
                        controller: 'DynamoController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/dynamo/dynamo.services.js',
                                        'app/dynamo/dynamo.controller.js',
                                    ]
                                });
                            }]
                        }
                    })

                .state('ng.business-user', {
                        url: '/business-user',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.business-user.list', {
                        url: '/list',
                        templateUrl: 'app/business_user/list.html',
                        data: {
                            pageTitle: 'Business User'
                        },
                        controller: 'BusinessUserController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/business_user/business_user.services.js',
                                        'app/business_user/business_user.controller.js'


                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.business-user.add', {
                        url: '/add',
                        templateUrl: 'app/business_user/add.html',
                        data: {
                            pageTitle: 'Business User'
                        },
                        controller: 'BusinessUserController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/business_user/business_user.services.js',
                                        'app/business_user/business_user.controller.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.business-user.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/business_user/edit.html',
                        data: {
                            pageTitle: 'Business User'
                        },
                        controller: 'BusinessUserController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/business_user/business_user.services.js',
                                        'app/business_user/business_user.controller.js'
                                    ]
                                });
                            }]
                        }
                    })




                //Market Store Catalog navigation starts

                .state('ng.market-store-catalog', {
                        url: '/market-store-catalog',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.market-store-catalog.list', {
                        url: '/list/:storeid',
                        templateUrl: 'app/marketplace/market_store_catalog/list.html',
                        data: {
                            pageTitle: 'Market Store Catalog'
                        },
                        controller: 'MarketStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_store_catalog/marketstorecatalog_search.services.js',
                                        'app/marketplace/market_store_catalog/marketstorecatalog.controller.js',
                                        'app/marketplace/market_store_catalog/marketstorecatalog.filter.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store-catalog.add', {
                        url: '/add/:storeid',
                        templateUrl: 'app/marketplace/market_store_catalog/add.html',
                        data: {
                            pageTitle: 'Add Market Store Catalog'
                        },
                        controller: 'MarketStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_store_catalog/marketstorecatalog.controller.js',
                                        'app/marketplace/market_store_catalog/marketstorecatalog_search.services.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store-catalog.edit', {
                        url: '/edit/:storeid/:id',
                        templateUrl: 'app/marketplace/market_store_catalog/edit.html',
                        data: {
                            pageTitle: 'Edit Market Store Catalog'
                        },
                        controller: 'MarketStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_store_catalog/marketstorecatalog.controller.js',
                                        'app/marketplace/market_store_catalog/marketstorecatalog_search.services.js'
                                    ]
                                });
                            }]
                        }
                    })



                //market place items navigation starts
                .state('ng.market-items', {
                        url: '/market-items',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.market-items.list', {
                        url: '/list/:storeid/:catid',
                        templateUrl: 'app/marketplace/market_items/list.html',
                        data: {
                            pageTitle: 'Market Items List'
                        },
                        controller: 'MarketItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_items/market_items.controller.js',
                                        'app/marketplace/market_items/market_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-items.add', {
                        url: '/add/:storeid/:catid',
                        templateUrl: 'app/marketplace/market_items/add.html',
                        data: {
                            pageTitle: 'Add Market Items'
                        },
                        controller: 'MarketItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/marketplace/market_items/market_items.controller.js',
                                        'app/marketplace/market_items/market_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-items.edit', {
                        url: '/edit/:storeid/:catid/:id',
                        templateUrl: 'app/marketplace/market_items/edit.html',
                        data: {
                            pageTitle: 'Edit Market Items'
                        },
                        controller: 'MarketItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/marketplace/market_items/market_items.controller.js',
                                        'app/marketplace/market_items/market_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })

                .state('ng.market-store', {
                        url: '/market-store',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.market-store.list', {
                        url: '/list',
                        templateUrl: 'app/marketplace/market_store/list.html',
                        data: {
                            pageTitle: 'Market Store List'
                        },
                        controller: 'MarketStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_store/market_store.controller.js',
                                        'app/marketplace/market_store/market_store.services.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/marketplace/market_store/market_store_search.services.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store.globalsearch', {
                        url: '/global-search',
                        templateUrl: 'app/marketplace/market_store/global_search.html',
                        data: {
                            pageTitle: 'Market Store Global Search'
                        },
                        controller: 'MarketStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/marketplace/market_store/market_store.controller.js',
                                        'app/marketplace/market_store/market_store.services.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/marketplace/market_store/market_store_search.services.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store.add', {
                        url: '/add',
                        templateUrl: 'app/marketplace/market_store/add.html',
                        data: {
                            pageTitle: 'Add Market Store'
                        },
                        controller: 'MarketStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/marketplace/market_store/market_store.controller.js',
                                        'app/marketplace/market_store/market_store.services.js',
                                        'app/marketplace/market_store/market_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/marketplace/market_store/market_store_search.services.js',
                                        'app/restaurant/restaurant.services.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/0.10.3/angular-moment.min.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/marketplace/market_store/edit.html',
                        data: {
                            pageTitle: 'Edit Market Store'
                        },
                        controller: 'MarketStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/marketplace/market_store/market_store.controller.js',
                                        'app/marketplace/market_store/market_store.services.js',
                                        'app/marketplace/market_store/market_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/marketplace/market_store/market_store_search.services.js',
                                        'app/restaurant/restaurant.services.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/0.10.3/angular-moment.min.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.market-store.view-contact-info', {
                        url: '/view-contact-info/:id',
                        templateUrl: 'app/marketplace/market_store/view_contact.html',
                        data: {
                            pageTitle: 'View Market Store Contacts'
                        },
                        controller: 'MarketStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'app/marketplace/market_store/market_store.controller.js',
                                        'app/marketplace/market_store/market_store.services.js',
                                        'app/marketplace/market_store/market_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/marketplace/market_store/market_store_search.services.js',
                                    ]
                                });
                            }]
                        }
                    })

                //Alcohol Store starts
                .state('ng.alcohol-store', {
                        url: '/alcohol-store',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.alcohol-store.list', {
                        url: '/list',
                        templateUrl: 'app/alcohol/alcohol_store/list.html',
                        data: {
                            pageTitle: 'Alcohol Store List'
                        },
                        controller: 'AlcoholStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_store/alcohol_store.controller.js',
                                        'app/alcohol/alcohol_store/alcohol_store.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store_search.services.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store.globalsearch', {
                        url: '/global-search',
                        templateUrl: 'app/alcohol/alcohol_store/global_search.html',
                        data: {
                            pageTitle: 'Alcohol Global Search'
                        },
                        controller: 'AlcoholStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_store/alcohol_store.controller.js',
                                        'app/alcohol/alcohol_store/alcohol_store.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store_search.services.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store.add', {
                        url: '/add',
                        templateUrl: 'app/alcohol/alcohol_store/add.html',
                        data: {
                            pageTitle: 'Add Alcohol Store'
                        },
                        controller: 'AlcoholStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/alcohol/alcohol_store/alcohol_store.controller.js',
                                        'app/alcohol/alcohol_store/alcohol_store.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store_search.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/restaurant/restaurant.services.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/0.10.3/angular-moment.min.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store.edit', {
                        url: '/edit/:id',
                        templateUrl: 'app/alcohol/alcohol_store/edit.html',
                        data: {
                            pageTitle: 'Edit Alcohol Store'
                        },
                        controller: 'AlcoholStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/alcohol/alcohol_store/alcohol_store.controller.js',
                                        'app/alcohol/alcohol_store/alcohol_store.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store_search.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/restaurant/restaurant.services.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js',
                                        //'https://cdnjs.cloudflare.com/ajax/libs/angular-moment/0.10.3/angular-moment.min.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store.view-contact-info', {
                        url: '/view-contact-info/:id',
                        templateUrl: 'app/alcohol/alcohol_store/view_contact.html',
                        data: {
                            pageTitle: 'View Alcohol Store Contacts'
                        },
                        controller: 'AlcoholStoreController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'app/alcohol/alcohol_store/alcohol_store.controller.js',
                                        'app/alcohol/alcohol_store/alcohol_store.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store_search.services.js',
                                        'app/alcohol/alcohol_store/alcohol_store.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    })

                //Market Store Catalog navigation starts
                .state('ng.alcohol-store-catalog', {
                        url: '/alcohol-store-catalog',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.alcohol-store-catalog.list', {
                        url: '/list/:storeid',
                        templateUrl: 'app/alcohol/alcohol_store_catalog/list.html',
                        data: {
                            pageTitle: 'Alcohol Store Catalog'
                        },
                        controller: 'AlcoholStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog_search.services.js',
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog.controller.js',
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog.filter.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store-catalog.add', {
                        url: '/add/:storeid',
                        templateUrl: 'app/alcohol/alcohol_store_catalog/add.html',
                        data: {
                            pageTitle: 'Add Alcohol Store Catalog'
                        },
                        controller: 'AlcoholStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog.controller.js',
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog_search.services.js'
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-store-catalog.edit', {
                        url: '/edit/:storeid/:id',
                        templateUrl: 'app/alcohol/alcohol_store_catalog/edit.html',
                        data: {
                            pageTitle: 'Edit Alcohol Store Catalog'
                        },
                        controller: 'AlcoholStoreCatalogController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog.controller.js',
                                        'app/alcohol/alcohol_store_catalog/alcoholstorecatalog_search.services.js'
                                    ]
                                });
                            }]
                        }
                    })


                //alcohol items navigation starts
                .state('ng.alcohol-items', {
                        url: '/alcohol-items',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.alcohol-items.list', {
                        url: '/list/:storeid/:catid',
                        templateUrl: 'app/alcohol/alcohol_items/list.html',
                        data: {
                            pageTitle: 'Alcohol Items List'
                        },
                        controller: 'AlcoholItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/alcohol/alcohol_items/alcohol_items.controller.js',
                                        'app/alcohol/alcohol_items/alcohol_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-items.add', {
                        url: '/add/:storeid/:catid',
                        templateUrl: 'app/alcohol/alcohol_items/add.html',
                        data: {
                            pageTitle: 'Add Alcohol Items'
                        },
                        controller: 'AlcoholItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/alcohol/alcohol_items/alcohol_items.controller.js',
                                        'app/alcohol/alcohol_items/alcohol_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.alcohol-items.edit', {
                        url: '/edit/:storeid/:catid/:id',
                        templateUrl: 'app/alcohol/alcohol_items/edit.html',
                        data: {
                            pageTitle: 'Edit Alcohol Items'
                        },
                        controller: 'AlcoholItemsController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                                        'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
                                        'app/alcohol/alcohol_items/alcohol_items.controller.js',
                                        'app/alcohol/alcohol_items/alcohol_items.services.js',
                                    ]
                                });
                            }]
                        }
                    })
                    /*.state('ng.restaurant.multiple-restaurants', {
                        url: '/multiple-restaurants',
                        templateUrl: 'app/restaurant/add_multiple_res.html',
                        data: {
                            pageTitle: 'Add Multiple Restaurant'
                        },
                        controller: 'AddMultipleRestaurantController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'app/restaurant/addMultipleRestaurant.controller.js',
                                        'app/restaurant/restaurant.controller.js',
                                        'app/restaurant/restaurant.services.js',
                                    ]
                                });
                            }]
                        }
                    })*/
                    .state('ng.customer.order', {
                        url: '/order',
                        abstract: true,
                        template: '<ui-view/>'
                    })
                    .state('ng.customer.order.order-confirmation', {
                        url: '/order-confirmation/:orderNumber',
                        templateUrl: 'app/customer/order/confirmation.html',
                        data: {
                            pageTitle: 'Order Confirmation'
                        },
                        controller: 'OrderConfirmationController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/apps/css/customer-order.css',
                                        'app/customer/order/order-confirmation.controller.js',
                                    ]
                                });
                            }]
                        }
                    })
                    .state('ng.customer.order.add', {
                        url: '/add/:customerId',
                        templateUrl: 'app/customer/order/add.html',
                        data: {
                            pageTitle: 'Add Order Details'
                        },
                        controller: 'CustomerOrderController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/apps/css/customer-order.css',
                                        'assets/pages/css/search.min.css',
                                        'assets/global/plugins/underscore.js',
                                        'app/customer/order/customer-order.controller.js',
                                        'app/customer/order/order.services.js',
                                        'app/customer/order/address-typeahead.service.js',
                                        'app/customer/order/order.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/customer/customer.services.js',
                                        'app/customer/customerZone.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                    ]
                                });
                            }]
                        }
                    }).state('ng.customer.order.checkout', {
                        url: '/checkout/:resId',
                        templateUrl: 'app/customer/order/checkout.html',
                        data: {
                            pageTitle: 'Order Checkout'
                        },
                        controller: 'CustomerOrderController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/apps/css/customer-order.css',
                                        'assets/pages/css/search.min.css',
                                        'assets/global/plugins/underscore.js',
                                        'app/customer/order/customer-order.controller.js',
                                        'app/customer/order/order.services.js',
                                        'app/customer/order/order.directives.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/customer/customer.services.js',
                                        'app/customer/customerZone.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/customer/order/address-typeahead.service.js',

                                    ]
                                });
                            }]
                        }
                    }).state('ng.customer.order.place-order', {
                        url: '/place-order',
                        templateUrl: 'app/customer/order/place-order.html',
                        data: {
                            pageTitle: 'Place Order'
                        },
                        controller: 'PlaceOrderController',
                        authenticate: true,
                        resolve: {
                            deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'FoodjetsApp',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
                                        'assets/apps/css/customer-order.css',
                                        'assets/apps/scripts/securesubmit.js',
                                        'assets/pages/css/search.min.css',
                                        'assets/global/plugins/underscore.js',
                                        'app/filter.js',
                                        'app/customer/order/place-order.controller.js',
                                        'app/customer/order/order.directives.js',
                                        'app/customer/order/order.services.js',
                                        'app/customer/order/cart.service.js',
                                        'app/market_office/market_office_city.services.js',
                                        'app/customer/customer.services.js',
                                        'app/customer/customerZone.services.js',
                                        'app/market_office/delivery_zone.services.js',
                                        'app/customer/order/address-typeahead.service.js',
                                    ]
                                });
                            }]
                        }
                    });






            }
        ]);
})();

(function() {
    'use strict';
    angular.module('FoodjetsApp').run(
        ['$rootScope', 'settings', '$state', 'authService', '$cookies', '$location', 'editableOptions',
            function($rootScope, settings, $state, authService, $cookies, $location, editableOptions) {
                // set theme for editable fields
                editableOptions.theme = 'bs3';
                $rootScope.$state = $state; // state to be accessed from view
                $rootScope.$settings = settings; // state to be accessed from view
                $rootScope.okeys = function(o) {
                    return Object.keys(o).length;
                };
                // Redirect to login if route requires auth and you're not logged in
                $rootScope.$on('$stateChangeStart', function(event, next) {
                    if (next.authenticate === true) {

                        authService.isSignedIn(function(loggedIn) {

                            if (!loggedIn) {
                                $cookies.remove('foodjets');
                                $location.path('/login');
                            }
                        });
                    }
                    if (next.authenticate === false) {
                        authService.isSignedIn(function(loggedIn) {
                            if (loggedIn) {
                                $location.path('/ng/dashboard');
                            }
                        });
                    }
                });
            }
        ]);
})();


(function() {
    'use strict';


    angular.module("FoodjetsApp").factory('Interceptor', function($rootScope, $q, $cookies, $location) {

        return {
            // Add authorization token to headers
            request: function(config) {
                //console.log(config);

                config.headers = config.headers || {};
                if ($cookies.get('foodjets')) {

                    // Create json for cookie
                    var cookie = angular.fromJson($cookies.get('foodjets'));

                    // Create header
                    config.headers.Authorization = 'Bearer ' + cookie.id;
                }
                return config;
            },

            // Intercept 401s and redirect you to login
            responseError: function(response) {
                //$location.path('/login');
                return $q.reject(response);
            },
            response: function(response) {

                // do something on success
                return response;
            }

        };
    });
})();
