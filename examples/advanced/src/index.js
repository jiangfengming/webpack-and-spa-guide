import SpaHistory from 'spa-history';

new SpaHistory({
  onNavigate(location) {
    System.import('./views' + location.path + '/index.js').then(module => {
      const View = module.default;
      const view = new View();
      view.mount(document.body);
    });
  }
});
