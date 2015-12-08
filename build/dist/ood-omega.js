
/*
To define a model
@author Phoenix Grey
 */

(function() {
  var CssManager, Directive, DirectiveSchool, Model;

  Model = (function() {

    /*
    Construct a model
     */
    function Model(data) {
      this.data = data;
    }

    return Model;

  })();


  /*
  To define a css manager
  @author Phoenix Grey
   */

  CssManager = (function() {
    function CssManager() {}

    return CssManager;

  })();


  /*
  To define a directive
  @author Phoenix Grey
   */

  Directive = (function() {

    /*
    Construct a directive by config, model, and events
    @param params [dict] Parameters of angular directive
    @param modelKlass [subclass of Model] Model class the directive uses to manipulate data 
    @param cssKlass [subClass of cssManager] CssManager class the directive uses to control css
     */
    function Directive(params, modelKlass, cssKlass) {
      var scope;
      this.modelKlass = modelKlass || Model;
      this.cssKlass = cssKlass || CssManager;
      this.params = {
        restrict: 'E',
        templateUrl: '',
        scope: {
          storage: "=info",
          cssManager: "="
        }
      };
      scope = this.params.scope;
      if (params && params.scope) {
        scope = _.extend(this.params.scope, params.scope);
      }
      _.extend(this.params, params);
      this.params.scope = scope;
      this.initLink();
    }


    /*
    merge directive cssKlass and customerized one 
    @param customerCssManager [Class] customerized css manager defined from directive attribute css-manager
     */

    Directive.prototype.mergeCssKlass = function(customerCssManager) {
      _.extendOwn(this.cssKlass, customerCssManager);
      return this.cssKlass;
    };


    /*
    Called when directive is initiated, which is used to be extended by sub classes
     */

    Directive.prototype.linkFn = function(scope, element, attr) {
      this.scope = scope;
      _.extend(scope, {
        model: new this.modelKlass(scope.storage),
        css: this.mergeCssKlass(scope.cssManager)
      });
      scope.$watch('storage', (function(_this) {
        return function(nv, ov) {
          if (nv !== ov) {
            return scope.model = new _this.modelKlass(nv);
          }
        };
      })(this));
      return scope.$watch('cssManager', (function(_this) {
        return function(nv, ov) {
          if (nv !== ov) {
            return scope.css = _this.mergeCssKlass(nv);
          }
        };
      })(this));
    };


    /*
    Initialize link function of angular directive
    @private
     */

    Directive.prototype.initLink = function() {
      return this.params['link'] = {
        pre: (function(_this) {
          return function(scope, element, attr) {
            return _this.linkFn(scope, element, attr);
          };
        })(this)
      };
    };

    return Directive;

  })();


  /*
  To register directives in app
  @author Phoenix Grey
   */

  DirectiveSchool = (function() {
    function DirectiveSchool() {}


    /*
    @param app [angular.module] The angular module the directive is registered to
    @param directiveName [string] The directive name
    @param directive [angular.directive] The directive to be registered
     */

    DirectiveSchool.register = function(app, directiveName, directive) {
      return app.directive(directiveName, function() {
        return directive.params;
      });
    };

    return DirectiveSchool;

  })();

  this.Model = Model;

  this.CssManager = CssManager;

  this.DirectiveSchool = DirectiveSchool;

  this.Directive = Directive;

}).call(this);

(function() {
  var Table, TableCssManager, TableDirective, directiveDir,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  directiveDir = 'lib/table/';


  /*
  To define a table model
  @extend Model
   */

  Table = (function(superClass) {
    extend(Table, superClass);


    /*
    To construct an instance of table model
    @param data [Array<Dict>] data to be displayed in table
     */

    function Table(rawData) {
      this.rawData = rawData != null ? rawData : [];
      this.initTable();
    }


    /*
    To update table model by data
     */

    Table.prototype.initTable = function() {
      this.initFields();
      this.initSorting();
      this.setPagination();
      this.updateTableData();
      return this.updateCurrentPage();
    };


    /*
    To initialize table fields, including all fields, fields displayed in column, displayed in detail
     */

    Table.prototype.initFields = function() {
      this.fieldsSample = _.has(this.rawData, '0') ? this.rawData[0] : {};
      return this.fields = this.detailFields = this.columnFields = _.keys(this.fieldsSample);
    };


    /*
    To initialize sorting statuses and functions
     */

    Table.prototype.initSorting = function() {
      return this.sort = _.mapObject(this.fieldsSample, function(_f) {
        var s;
        return s = {
          fn: _.identity,
          order: 0
        };
      });
    };


    /*
    To set table data by columnFields and detailFields
     */

    Table.prototype.updateTableData = function() {
      return this.data = _.map(this.rawData, (function(_this) {
        return function(d) {
          var tmp;
          tmp = {};
          tmp.columnData = _.pick(d, _this.columnFields);
          tmp.detailData = _.pick(d, _this.detailFields);
          return tmp;
        };
      })(this));
    };


    /*
    To set pagination
    @param currentPage [number]
    @param numberPerPage [number] number of records per page
     */

    Table.prototype.setPagination = function(currentPage, numberPerPage) {
      var j, ref, results;
      this.numPerPage = numberPerPage != null ? numberPerPage : 2;
      this.numPages = Math.ceil(this.rawData.length / this.numPerPage);
      this.currentPage = currentPage != null ? currentPage : 1;
      return this.pageRange = this.numPages === 0 ? [] : (function() {
        results = [];
        for (var j = 1, ref = this.numPages; 1 <= ref ? j <= ref : j >= ref; 1 <= ref ? j++ : j--){ results.push(j); }
        return results;
      }).apply(this);
    };


    /*
    To get data by current page
     */

    Table.prototype.updateCurrentPage = function() {
      this.from = (this.currentPage - 1) * this.numPerPage;
      this.to = this.from + this.numPerPage - 1;
      this.currentData = this.data.slice(this.from, +this.to + 1 || 9e9);
      return this.activeDetailIndex = -1;
    };


    /*
    To reset order status by field
    @param field [string] field the data is sorted by
    @param order [number] enum: -1(des), 0(no ordered), 1(asc)
     */

    Table.prototype.resetOrder = function(field, order) {
      return _.each(this.sort, function(v, k) {
        if (k !== field) {
          return v.order = 0;
        } else {
          return v.order = order;
        }
      });
    };


    /*
    To sort table data by field
    @param field [string] field the data is sorted by
     */

    Table.prototype.sortBy = function(field) {
      var currentOrder, order;
      currentOrder = this.sort[field].order;
      order = currentOrder === 0 ? -1 : -currentOrder;
      this.rawData = _.sortBy(this.rawData, (function(_this) {
        return function(d) {
          return _this.sort[field].fn(d[field]);
        };
      })(this));
      if (order === -1) {
        this.rawData.reverse();
      }
      this.resetOrder(field, order);
      this.updateTableData();
      return this.updateCurrentPage();
    };


    /*
    To set current page and update data by current page
    @param page [number] current page
     */

    Table.prototype.setCurrentPage = function(page) {
      if (page <= 0) {
        page = 1;
      } else if (page >= this.numPages) {
        page = this.numPages;
      }
      this.setPagination(page, this.numPerPage);
      return this.updateCurrentPage();
    };


    /*
    To set column fields, detail fields
    @param cFields [Array<string>] column fields
    @param dFields [Array<string>] detail fields
     */

    Table.prototype.setFields = function(cFields, dFields) {
      this.columnFields = _.intersection(cFields, this.fields);
      this.detailFields = _.intersection(dFields, this.fields);
      this.updateTableData();
      return this.updateCurrentPage();
    };


    /*
    Set Title Display
    @param titles [Object] title representation
     */

    Table.prototype.setTitles = function(titles) {
      return this.titles = _.mapObject(this.fieldsSample, function(v, k) {
        var ref, t;
        return t = (ref = titles && titles[k]) != null ? ref : k;
      });
    };


    /*
    get Title Display
    @param t [String] title key
     */

    Table.prototype.getTitle = function(t) {
      if (this.titles) {
        return this.titles[t];
      } else {
        return t;
      }
    };


    /*
    get sort order by sorting key
    @param _f [String] sorting key
     */

    Table.prototype.getSortOrder = function(_f) {
      return this.sort[_f].order;
    };


    /*
    To toggle detail
    @param _index [number] index of record whose detail is to be displayed
     */

    Table.prototype.toggleDetail = function(_index) {
      return this.activeDetailIndex = this.activeDetailIndex !== _index ? _index : -1;
    };


    /*
    To set sorting methods
    @param key [String] field
    @param fn [function] sorting function
     */

    Table.prototype.setFieldSorting = function(key, fn) {
      return this.sort[key] = {
        fn: fn,
        order: 0
      };
    };


    /*
    To set sorting methods by an object
    @param sort [Dict] sorting functions dict
     */

    Table.prototype.setSortings = function(sort) {
      return _.mapObject(sort, (function(_this) {
        return function(fn, key) {
          return _this.setFieldSorting(key, fn);
        };
      })(this));
    };


    /*
    Check whether detail of record by index should be displayed
    @param _index [number] index of record to be judged
     */

    Table.prototype.detailDisplayed = function(_index) {
      return _index === this.activeDetailIndex;
    };

    return Table;

  })(Model);


  /*
  To define table css manager
  @extend CssManager
   */

  TableCssManager = (function() {
    function TableCssManager() {}


    /*
    table tr style
    @param item [Object] a record in the table
     */

    TableCssManager.brief = function(item) {};


    /*
    row detail style
    @param item [Object] a record in the table
     */

    TableCssManager.detail = function(item) {};


    /*
    table td style
    @param item [Object] brief data in a record of the table
     */

    TableCssManager.td = function(item) {};


    /*
    table cell style
    @param key [String] field of table
    @param value [Object] cell content
     */

    TableCssManager.cellContent = function(key, value) {};


    /*
    cell icon style
    @param key [String] field of table
    @param value [Object] cell content
     */

    TableCssManager.cellIcon = function(key, vaule) {};


    /*
    cell style
    @param key [String] field of table
    @param value [Object] cell content
     */

    TableCssManager.cell = function(key, value) {};


    /*
    sort order
    @param order [enum] -1, 1, others
     */

    TableCssManager.sortState = function(order) {
      switch (order) {
        case -1:
          return "fa-sort-up";
        case 1:
          return "fa-sort-down";
        default:
          return "fa-sort";
      }
    };


    /*
    page index style
    @param actived [number] actived page num
    @param i [number] current page num
     */

    TableCssManager.pageState = function(actived, i) {
      var v;
      return v = (function() {
        switch (false) {
          case actived !== i:
            return 'is-active';
        }
      })();
    };


    /*
    pagination prev style
    @param actived [number] actived page num
     */

    TableCssManager.prevPageState = function(actived) {
      var v;
      return v = (function() {
        switch (false) {
          case actived !== 1:
            return 'is-disabled';
        }
      })();
    };


    /*
    pagination next style
    @param actived [number] actived page num
    @param last [number] last page num
     */

    TableCssManager.nextPageState = function(actived, last) {
      var v;
      return v = (function() {
        switch (false) {
          case actived !== last:
            return 'is-disabled';
        }
      })();
    };

    return TableCssManager;

  })();


  /*
  To define table directive
  @extend Directive
   */

  TableDirective = (function(superClass) {
    extend(TableDirective, superClass);


    /*
    Construct an instance of TableDirective
    @param params [Dict] parameters of angular directive
    @param cssKlass [Class] css management class for TableDirective
     */

    function TableDirective(params, cssKlass) {
      this.linkFn = bind(this.linkFn, this);
      var tableParams;
      params = params != null ? params : {};
      cssKlass = cssKlass != null ? cssKlass : TableCssManager;
      tableParams = {
        templateUrl: directiveDir + 'table.html',
        scope: {
          cFields: '=cFields',
          dFields: '=dFields',
          numPerPage: '=numPerPage',
          titles: '=titles',
          sortings: '='
        }
      };
      _.extend(params, tableParams);
      TableDirective.__super__.constructor.call(this, params, Table, cssKlass);
    }


    /*
    Refresh the table scope fields when model is refreshed
    @param scope [Dict] scope of directive
    @param flish [boolean] refresh or not
     */

    TableDirective.prototype.refresh = function(scope, flush) {
      var ref, ref1;
      if (flush) {
        scope.model.setPagination(1, scope.numPerPage);
        scope.cFields = (ref = scope.cFields) != null ? ref : scope.model.fields;
        scope.dFields = (ref1 = scope.dFields) != null ? ref1 : scope.model.fields;
        scope.model.setFields(scope.cFields, scope.dFields);
        scope.model.setTitles(scope.titles);
        return scope.model.setSortings(scope.sortings);
      }
    };


    /*
    To initialize link function of table directive
     */

    TableDirective.prototype.linkFn = function(scope, element, attr) {
      TableDirective.__super__.linkFn.call(this, scope, element, attr);
      return scope.$watch('model', (function(_this) {
        return function(nv, ov) {
          return _this.refresh(scope, nv !== ov);
        };
      })(this));
    };

    return TableDirective;

  })(Directive);

  this.TableDirective = TableDirective;

  this.TableCssManager = TableCssManager;

}).call(this);

(function() {
  var Footer, FooterCssManager, FooterDirective, directiveDir,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  directiveDir = 'lib/footer/';


  /*
  To define a footer model
  @extend Model
   */

  Footer = (function(superClass) {
    extend(Footer, superClass);


    /*
    To construct an instance of footer model
    @param data [Array<Dict>] data to be displayed in footer
     */

    function Footer(data) {
      var defaultData;
      defaultData = {
        copyright: "EMPTY copyright",
        version: "EMPTY version",
        websites: []
      };
      this.rawData = _.extend(defaultData, data);
      this.copyright = this.rawData.copyright;
      this.version = this.rawData.version;
      this.websites = this.rawData.websites;
      this.lenOfSites = this.rawData.websites.length;
    }


    /*
    To get the first value of an object
    @param o [Object]
     */

    Footer.prototype.getLink = function(o) {
      return (_.values(o))[0];
    };


    /*
    To get the first key of an object
    @param o [Object]
     */

    Footer.prototype.getName = function(o) {
      return (_.keys(o))[0];
    };

    return Footer;

  })(Model);


  /*
  To define footer css manager
   */

  FooterCssManager = (function() {
    function FooterCssManager() {}

    return FooterCssManager;

  })();


  /*
  To define footer directive
  @extend Directive
   */

  FooterDirective = (function(superClass) {
    extend(FooterDirective, superClass);


    /*
    Construct an instance of FooterDirective
    @param params [dict] Parameters of angular directive
     */

    function FooterDirective(params) {
      var footerParams;
      params = params != null ? params : {};
      footerParams = {
        templateUrl: directiveDir + 'footer.html',
        replace: true
      };
      _.extend(params, footerParams);
      FooterDirective.__super__.constructor.call(this, params, Footer, FooterCssManager);
    }

    return FooterDirective;

  })(Directive);

  this.FooterDirective = FooterDirective;

}).call(this);

(function() {
  var ACTIVE, COLLAPSED, EXPANDED, INACTIVE, NodeState, Sidebar, SidebarCssManager, SidebarDirective, directiveDir, merge,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  directiveDir = 'lib/sidebar/';

  ACTIVE = 0;

  INACTIVE = 1;

  COLLAPSED = 0;

  EXPANDED = 1;


  /*
  To convert an array of dict to a dict
  @param _L [Array<Dict>]
   */

  merge = function(_L) {
    var v;
    v = {};
    _.each(_L, function(_item) {
      return _.extend(v, _item);
    });
    return v;
  };


  /*
  To define sidebar css manager
   */

  SidebarCssManager = (function() {
    function SidebarCssManager() {}


    /*
    To control active style
    @param activation [emum] ACTIVE, INACTIVE
     */

    SidebarCssManager.getState = function(activation) {
      switch (activation) {
        case ACTIVE:
          return 'is-active';
        case INACTIVE:
          return '';
      }
    };


    /*
    To control arrowIcon direction
    @param expansion [enum] COLLAPSED, EXPANDED
     */

    SidebarCssManager.getExpansion = function(expansion) {
      switch (expansion) {
        case COLLAPSED:
          return 'fa fa-angle-down';
        case EXPANDED:
          return 'fa fa-angle-up';
        default:
          return '';
      }
    };


    /*
    To control expansion
    @param expansion [enum] COLLAPSED, EXPANDED
     */

    SidebarCssManager.expanded = function(expansion) {
      switch (expansion) {
        case COLLAPSED:
          return false;
        case EXPANDED:
          return true;
        default:
          return '';
      }
    };

    return SidebarCssManager;

  })();


  /*
  To abstract state for menu item, which is so-called Node
   */

  NodeState = (function() {

    /*
    To construct an instance of NodeState
    @param id [string] node name or subnode name
    @param content [object<dict>] node content
    @param hasFather [boolean/string] node father existence or father id
     */
    function NodeState(id, content, hasFather) {
      this.id = id;
      this.hasChildren = content ? content.subnodes !== void 0 : void 0;
      this.hasFather = hasFather != null ? hasFather : false;
      this.expansion = this.hasChildren ? COLLAPSED : void 0;
      this.activation = INACTIVE;
    }


    /*
    To activate node, including setting expansion and activation 
    retrun an activated node id and expanded node id
     */

    NodeState.prototype.activate = function() {
      var AK, EK;
      AK = EK = void 0;
      if (this.expansion !== void 0) {
        this.toggle();
        EK = this.expansion === EXPANDED ? this.id : void 0;
      } else {
        this.activation = ACTIVE;
        AK = this.id;
        EK = this.hasFather ? this.hasFather : void 0;
      }
      return [AK, EK];
    };


    /*
    To set expansion EXPANDED if it is COLLAPSED
     */

    NodeState.prototype.expand = function() {
      return this.expansion = this.expansion === COLLAPSED ? EXPANDED : void 0;
    };


    /*
    To toggle expansion value between COLLAPSED and EXPANDED
     */

    NodeState.prototype.toggle = function() {
      return this.expansion = this.expansion === COLLAPSED ? EXPANDED : COLLAPSED;
    };

    return NodeState;

  })();


  /*
  To define a sidebar model
  @extend Model
   */

  Sidebar = (function(superClass) {
    extend(Sidebar, superClass);


    /*
    To construct sidebar model
    @param rawData [Object] info data imported from user
     */

    function Sidebar(rawData) {
      this.rawData = _.filter(rawData, function(v) {
        return v !== void 0 && (_.keys(v)).length !== 0;
      });
      this.initStates();
    }


    /*
    To initialize the state of nodes, subnodes and turn them into a flat data structure
     */

    Sidebar.prototype.initStates = function() {
      var t;
      t = _.map(this.rawData, function(val, index) {
        var _tmp, sectionNodes;
        sectionNodes = _.map(val, function(nodeContent, nodeId) {
          var nodes, subnodes;
          nodes = {};
          nodes[nodeId] = new NodeState(nodeId, nodeContent, false);
          subnodes = _.mapObject(nodeContent.subnodes, function(_subnode, _subid) {
            return new NodeState(_subid, _subnode, nodeId);
          });
          _.extend(nodes, subnodes);
          return nodes;
        });
        return _tmp = merge(sectionNodes);
      });
      return this.states = merge(t);
    };


    /*
    To set states according to their keys
    @param nodeId [string] node id or subnode id
     */

    Sidebar.prototype.setStates = function(nodeId) {
      var activatedKey, expandedKey, ref;
      nodeId = nodeId !== void 0 && nodeId !== '' ? nodeId : (_.keys(this.states))[0];
      ref = nodeId && this.states[nodeId] ? this.states[nodeId].activate() : [void 0, void 0], activatedKey = ref[0], expandedKey = ref[1];
      if (expandedKey) {
        return this.states[expandedKey].expand();
      }
    };


    /*
    To toggle a sidebar item
    @param nid [String] node id
     */

    Sidebar.prototype.toggle = function(nid) {
      return this.states[nid].toggle();
    };


    /*
    To set user
    @param user [String] user name
     */

    Sidebar.prototype.setUser = function(user) {
      return this.user = user != null ? user : 'anonymous';
    };

    return Sidebar;

  })(Model);


  /*
  To define sidebar directive
  @extend Directive
   */

  SidebarDirective = (function(superClass) {
    extend(SidebarDirective, superClass);


    /*
    To construct an instance of SidebarDirective
    @param params [Dict] parameters of angular directive
    @param cssKlass [Class] css management class for sidebar
     */

    function SidebarDirective(params, cssKlass) {
      var asideParams;
      params = params != null ? params : {};
      cssKlass = cssKlass != null ? cssKlass : SidebarCssManager;
      asideParams = {
        templateUrl: directiveDir + 'sidebar.html',
        scope: {
          activeItem: "=",
          user: "="
        }
      };
      _.extend(params, asideParams);
      SidebarDirective.__super__.constructor.call(this, params, Sidebar, cssKlass);
    }


    /*
    To initialize link function of table directive
     */

    SidebarDirective.prototype.linkFn = function(scope, element, attr) {
      SidebarDirective.__super__.linkFn.call(this, scope, element, attr);

      /*
      scope.$watch () ->
        scope.activeItem
      , (nV, oV) ->
        scope.setActiveItem nV
       */

      /*
      To set ACTIVE state to node or subnode according to activeItem
      @param item [string] node name or subnode name
       */
      scope.model.setStates(scope.activeItem);
      return scope.model.setUser(scope.user);

      /*
      scope.setActiveItem = (item) ->
        scope.model.initStates()
        scope.activeItem = item
        scope.model.setStates scope.activeItem
       */
    };

    return SidebarDirective;

  })(Directive);

  this.SidebarDirective = SidebarDirective;

}).call(this);


/*
Create an angular module called OODLIB
@author Phoenix Grey
 */

(function() {
  var a, d, f, lib;

  lib = angular.module("OODLib", ['gettext']);

  lib.run([
    'gettextCatalog', function(gettextCatalog) {
      gettextCatalog.currentLanguage = 'zh';
      return gettextCatalog.debug = true;
    }
  ]);


  /*
  Expose OOD to Browser as a global object
  @author Phoenix Grey
   */

  this.OOD = lib;

  d = new TableDirective();

  DirectiveSchool.register(OOD, 'ctable', d);

  f = new FooterDirective();

  DirectiveSchool.register(OOD, 'cfooter', f);

  a = new SidebarDirective();

  DirectiveSchool.register(OOD, 'caside', a);

}).call(this);

angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
/* jshint +W100 */
}]);
angular.module('OODLib').run(['$templateCache', function ($templateCache) {
	$templateCache.put('lib/footer/footer.html', '<div class="footer"><span class="copyright"> <span>Copyright © {{model.copyright}}</span><span class="line">|</span> <spen>Version: {{model.version}}</spen></span><span class="help"><span ng-repeat-start="site in model.websites"><a ng-href="{{model.getLink(site)}}" target="_blank">&nbsp;{{model.getName(site)}}&nbsp;</a></span><span ng-repeat-end="ng-repeat-end" ng-show="{{$index}}&lt;{{model.lenOfSites-1}}" class="line">|</span></span></div>');
	$templateCache.put('lib/sidebar/sidebar.html', '<sidebar> <div class="user-panel"> <div class="user-info"> <p translate="translate">Hello, {{model.user}}</p> </div> </div> <ul ng-repeat="section in model.rawData" class="menu"> <li ng-repeat="(nid, nObj) in section" ng-class="css.getState(model.states[nid].activation)"><a ng-if="model.states[nid].hasChildren" ng-click="model.toggle(nid)" href=""><i ng-class="nObj.icon"></i><span>{{nObj.name}}</span><i ng-class="css.getExpansion(model.states[nid].expansion)" class="is-align-right"></i></a><a ng-if="model.states[nid].hasChildren==false" ng-href="{{nObj.URL}}"><i ng-class="nObj.icon"></i><span>{{nObj.name}}</span></a> <ul ng-show="css.expanded(model.states[nid].expansion)" class="menu"> <li ng-repeat="(subNId, subNObj) in nObj.subnodes" ng-class="css.getState(model.states[subNId].activation)"><a ng-href="{{subNObj.URL}}"><i ng-class="subNObj.icon"></i><span>{{subNObj.name}}</span></a></li> </ul> </li> </ul> </sidebar>');
	$templateCache.put('lib/table/table.html', '<div class="responsive"> <table class="table table-sort table-detail-default table-stripped-4"> <thead> <tr> <th ng-repeat="t in model.columnFields" ng-click="model.sortBy(t)"> <span ng-bind="model.getTitle(t)"></span><i ng-class="css.sortState(model.getSortOrder(t))" class="fa"></i></th> </tr> </thead> <tbody> <tr ng-repeat-start="item in model.currentData" ng-click="model.toggleDetail($index)" ng-class="css.brief(item)"> <td ng-repeat="(k,v) in item.columnData" ng-class="css.td(item.columnData)"><span ng-class="css.cell(k,v)"><i ng-class="css.cellIcon(k,v)"></i><span ng-bind="v" class="css.cellContent(k,v)"></span></span></td> </tr> <tr ng-repeat-end="ng-repeat-end" ng-show="model.detailDisplayed($index)" ng-class="css.detail(item)"> <td colspan="{{model.columnFields.length}}" class="is-nopadding"> <div class="detail-default"> <div translate="translate" class="detail-title">details</div> <dl> <dt ng-repeat-start="(k,v) in item.detailData">{{model.getTitle(k)}}:</dt> <dd ng-repeat-end="(k,v) in item.detailData">{{v}}</dd> </dl> </div> </td> </tr> </tbody> </table> <div ng-show="model.data.length&gt;0" class="statistics"> <span> <span translate="translate">total</span><span ng-bind="model.data.length"> </span><span translate="translate">records</span></span> <ul class="pagination"> <li ng-class="css.prevPageState(model.currentPage)" ng-click="model.setCurrentPage(model.currentPage-1)"><a href="#">«</a></li> <li ng-repeat="i in model.pageRange" ng-click="model.setCurrentPage(i)" ng-class="css.pageState(model.currentPage, i)"><a href="#">{{i}}</a></li> <li ng-class="css.nextPageState(model.currentPage, model.numPages)" ng-click="model.setCurrentPage(model.currentPage+1)"><a href="#">»</a></li> </ul> </div> </div>');
}]);