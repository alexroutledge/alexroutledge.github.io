/* tslint:disable */
export const portfolioData = [
  {
    id: 'veritas-map',
    name: 'Dynamic Map',
    types: ['angular', 'd3', 'express', 'node'],
    logoUrl: '/assets/images/veritas_logo.png',
    imgUrl: '/assets/images/veritas_map.png',
    content: [
      'This is an interactive map that renders location data using Angular, D3 and Express.',
      'The user makes a request to a REST endpoint to retrieve a collection of locations and these are rendered dynamically using Angular and D3.',
      'PassportJS is used for authentication and Node is used to aggregate multiple API calls.'
    ],
    description: 'Interactive map view built using Angular, D3 and Express'
  },
  {
    id: 'veritas-dashboard',
    name: 'Dynamic Map',
    types: ['angular', 'd3', 'express', 'node'],
    logoUrl: '/assets/images/veritas_logo.png',
    imgUrl: '/assets/images/veritas_dashboard.png',
    content: [
      'This is an interactive dashboard that renders location data using Angular, D3 and Express.',
      'Users can drag, sort, customise and save their own dashboard views.',
      'PassportJS is used for authentication and Node is used to aggregate multiple API calls.'
    ],
    description: 'Interactive dashboard view built using Angular, D3 and Express'
  },
  {
    id: 'veritas-list',
    name: 'Dynamic Map',
    types: ['angular', 'd3', 'express', 'node'],
    logoUrl: '/assets/images/veritas_logo.png',
    imgUrl: '/assets/images/veritas_list.png',
    content: [
      'This is an interactive list view that renders location data using Angular, D3 and Express.',
      'Users can sort the list view. Requests are made using infinite scroll to minimise API calls and improve performance.',
      'PassportJS is used for authentication and Node is used to aggregate multiple API calls.'
    ],
    description: 'Interactive dashboard view built using Angular, D3 and Express'
  },
  {
    id: 'yell-maps',
    name: 'Dynamic Map',
    types: ['javascript', 'css', 'jquery', 'google maps'],
    logoUrl: '/assets/images/yell_logo.png',
    imgUrl: '/assets/images/yell_maps.png',
    content: [
      'This is a dynamic maps section that is populated with the latest reviews content based on the user\'s current location.',
      'The implementation retrieves the list of businesses via JSON and uses the Google Maps API to add the locations of recently reviewed businesses to the map.'
    ],
    description: 'Dynamic Maps homepage built using jQuery and the Google Maps API.'
  },
  {
    id: 'yell-smartphone',
    name: 'Discover',
    types: ['javascript', 'css', 'google maps'],
    logoUrl: '/assets/images/yell_logo.png',
    imgUrl: '/assets/images/yell_discover.png',
    content: [
      'This is a dynamic content area that shows food search queries based on the user\'s location.',
      'The user can either enter a location in the search box or initiate a query based on their geolocated address.',
      'To reduce the performance effect of multiple DOM updates (jank), DOM updates are handled via a queue system which ensures there is only 1 DOM read/write operation per animation frame.'
    ],
    description: 'Interactive smartphone homepage built using native JS and the Google Maps API.'
  },
  {
    id: 'perfumeshop-checkout',
    name: 'Checkout Redesign',
    types: ['javascript', 'css', 'jquery', 'backbone'],
    logoUrl: '/assets/images/perfumeshop_logo.gif',
    imgUrl: '/assets/images/perfume_checkout_redesign.png',
    content: [
      'The Perfume Shop had a complex checkout process and reduce the number of required steps from 4 to 3, whilst preserving existing bespoke functionality.',
      'Some of the bespoke features included the integration of a 90 minute delivery service called Shutl and restricting certain checkout features by country/region',
      'The client wanted the basket and checkout addresses to be updateable via AJAX. Backbone was used for this purpose to separate the front end logic into models, views and controllers.'
    ],
    description: 'Checkout redesign built using jQuery, Backbone, JSP/JSTL and XHTML.'
  },
  {
    id: 'thomaspink-loyalty',
    name: 'CRM/loyalty integration',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/thomaspink_logo.gif',
    imgUrl: '/assets/images/thomaspink_crm.png',
    content: [
      'Thomas Pink had a complex CRM project that integrated data from online channels with data collected from their physical stores.',
      'The \'My Account\' section was separated into mini views, containing features such as order history, wishlist etc.'
    ],
    description: 'CRM/loyalty integration built using jQuery, JSP/JSTL and XHTML.'
  },
  {
    id: 'claires-upgrade',
    name: 'Ecommerce platform upgrade',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/claires_logo.png',
    imgUrl: '/assets/images/claires_upgrade.png',
    content: [
      'This was a project to update the client to the most recent version of the ecommerce platform',
      'Primarily, this involved refactoring/improving the existing JSTL, JS and CSS code.'
    ],
    description: 'Platform upgrade built using jQuery, JSP/JSTL and XHTML.'
  },
  {
    id: 'austinreed-recommendations',
    name: 'Product recommendations integration',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/austinreed_logo.gif',
    imgUrl: '/assets/images/austinreed_peerius.png',
    content: [
      'This was a project to integrate with a third party called Peerius to supply recommendations based on products, searches and basket data.',
      'jQuery and Mustache was used to transform the JSON response from Peerius into various views on the website.'
    ],
    description: 'Product recommendations integration built using jQuery, Mustache, JSP/JSTL and XHTML.'
  },
  {
    id: 'perfumeshop-loyalty',
    name: 'CRM/loyalty integration',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/perfumeshop_logo.gif',
    imgUrl: '/assets/images/perfume_crm.png',
    content: [
      'This was a complex project to enable a multi-step loyalty flow, whilst integrating with CRM data from the client\'s existing system.',
      'Backbone was used to separate the front end logic into models, views and controllers.'
    ],
    description: 'CRM/loyalty integration built using jQuery, Backbone, JSP/JSTL and XHTML.'
  },
  {
    id: 'thomaspink-checkout',
    name: 'Checkout redesign',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/thomaspink_logo.gif',
    imgUrl: '/assets/images/thomaspink_checkout.png',
    content: [
      'This was a project to redesign the client\'s existing checkout flow, according to ecommerce best practice, taking into consideration recent MV/AB tests.',
      'JSTL, CSS and jQuery were used extensively for this project.'
    ],
    description: 'Checkout redesign built using jQuery, JSP/JSTL and XHTML.'
  },
  {
    id: 'citrix-design',
    name: 'Site redesign',
    types: ['javascript', 'css', 'jquery', 'JSP'],
    logoUrl: '/assets/images/citrix_logo.png',
    imgUrl: '/assets/images/citrix_redesign.png',
    content: [
      'This was a project to completely redesign the client\'s existing website.',
      'JSTL, CSS and jQuery were used extensively for this project.'
    ],
    description: 'Site redesign built using jQuery, JSP/JSTL and XHTML.'
  },
  {
    id: 'realtime-analytics',
    name: 'Real time analytics',
    types: ['javascript', 'backbone', 'firebase', 'google maps'],
    logoUrl: '/assets/images/github_logo.jpg',
    imgUrl: '/assets/images/realtime_analytics.png',
    content: [
      'This was an internal project to illustrate how real time analytics data could be used within the browser as a form of social proof. Examples uses include notifying users when a product is added to the basket/wishlist or to show the number of concurrent visitors to a site.'
    ],
    description: 'Internal project to prototype the use of real time analytics data, built using jQuery, Backbone and Firebase.'
  },
  {
    id: 'perfumeshop-mobile',
    name: 'Mobile optimized site',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/perfumeshop_logo.gif',
    imgUrl: '/assets/images/perfume_mobile.png',
    content: [
      'This was a project to create a mobile optimized site.',
      'JSTL, CSS and jQuery were used extensively for this project.'
    ],
    description: 'Mobile optimized site built using jQuery, JSP/JSTL and XHTML.'
  },
  {
    id: 'fab-product-selector',
    name: 'Product selector',
    types: ['javascript', 'css', 'jquery', 'JSTL'],
    logoUrl: '/assets/images/farrowandball_logo.jpg',
    imgUrl: '/assets/images/farrowandball_selector.png',
    content: [
      'This was a project to assist customers in choosing paint and wallpaper products.',
      'Customers enter various details about their room, e.g. measurements, paint type etc. and a product is dynamically chosen the matches their specific needs.',
      'JSTL, CSS and jQuery were used extensively for this project.'
    ],
    description: 'Product selector built using jQuery, JSP/JSTL and XHTML.'
  }
];
/* tslint:enable */
