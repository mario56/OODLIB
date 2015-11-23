describe "Directive Test", () ->
  it "Create Directive instance without arguments", (done) ->
    d = new SidebarDirective()
    (expect d).toBeDefined()
    (expect d.modelKlass).toBe Sidebar
    (expect d.cssKlass).toBe SidebarCssManager

    params =
      restrict: 'E'
      templateUrl: 'lib/sidebar/sidebar.html'
      scope:
        storage: "=info"
        activeItem: '='
    (expect d.params).toBeDefined()
    (expect d.params).toEqual jasmine.objectContaining params
    (expect d.params.link).toBeDefined()
    done()