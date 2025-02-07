import jQuery from "jquery";
 

window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333

import "popper.js";
import "bootstrap";

import instantsearch from "instantsearch.js/es";
import {
  searchBox,
  infiniteHits,
  configure,
  stats,
  refinementList,
  currentRefinements,
  sortBy
} from "instantsearch.js/es/widgets";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

// Typesense configuration
let TYPESENSE_SERVER_CONFIG = {
  apiKey: process.env.TYPESENSE_SEARCH_ONLY_API_KEY,
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  connectionTimeoutSeconds: 2
};

let TYPESENSE_SERVER_CONFIG2 = {
  apiKey: "NlaKdOPtGgpCyW2MY7QYBdI12H1nHXh8",
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  connectionTimeoutSeconds: 2
};

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: TYPESENSE_SERVER_CONFIG,
  additionalSearchParameters: {
    query_by: "title,content",
    exclude_fields: "content",
    collection: "writeups"
  }
});


const searchClient = typesenseInstantsearchAdapter.searchClient;

const search = instantsearch({
  searchClient,
  indexName: "writeups",
  routing: {
    stateMapping: {
      stateToRoute(uiState) {
        return {
          q: uiState.writeups.query,
          sort: uiState.writeups.sort_by,
          refinementList: uiState.writeups.refinementList
        };
      },
      routeToState(routeState) {
        return {
          writeups: {
            query: routeState.q,
            sort_by: routeState.sort,
            refinementList: routeState.refinementList
          }
        };
      }
    }
  },
  searchFunction(helper) {
    if (helper.state.query === "") {
      $("#results-section").addClass("d-none");
      $(".row.mb-5").removeClass("d-none"); 
      $("#stats").addClass("d-none");
    } else {
      $("#results-section").removeClass("d-none");
      $(".row.mb-5").addClass("d-none"); 
      $("#stats").removeClass("d-none"); 
      helper.search();
    }
  },
});

search.addWidgets([
  searchBox({
    container: "#searchbox",
    showSubmit: false,
    showReset: false,
    placeholder: "Search CTF writeups...",
    autofocus: true,
    cssClasses: {
      input: "form-control",
    },
  }),

  stats({
    container: "#stats",
    templates: {
      text: ({ nbHits, processingTimeMS }) => {
        return nbHits > 0 
          ? `Found ${nbHits.toLocaleString()} results in ${processingTimeMS}ms`
          : ''; 
      },
    },
    cssClasses: {
      text: 'text-center text-muted small',
    },
  }),

  infiniteHits({
    container: "#hits",
    cssClasses: {
      list: "list-unstyled",
      item: "card mb-3 shadow-sm",
      loadMore: "btn btn-primary d-block w-100 w-md-auto mx-auto mt-4",
      disabledLoadMore: 'd-none'
    },
    templates: {
      item: `
        <article class="card-body" itemscope itemtype="http://schema.org/TechnicalArticle">
          <h2 class="card-title h5 mb-3">
            <a href="{{ url }}" target="_blank" rel="noopener" itemprop="url">
              <span itemprop="name">{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</span>
            </a>
            {{#mirror_url}}
              <small>
                (<a href="{{ mirror_url }}" target="_blank" rel="noopener">mirror</a>)
              </small>
            {{/mirror_url}}
          </h2>
          <div class="card-subtitle text-muted">
            {{#author}}By {{ author }} • {{/author}}{{#date}}{{ date }}{{/date}}
          </div>
        </article>
      `,
      empty: `
        <div class="text-center">
          No writeups found for <q>{{ query }}</q>. Try another search term.
        </div>
      `,
      showMoreText: `
        {{^isLastPage}}
          Show more results
        {{/isLastPage}}
      `,
    },
  }),

  configure({
    hitsPerPage: 15,
    queryBy: "content,title"
  }),

  currentRefinements({
    container: "#current-refinements",
    cssClasses: {
      list: "list-unstyled",
      label: "d-none",
      item: "h5",
      category: "badge badge-light bg-light-2 px-3 m-2",
      categoryLabel: "text-capitalize",
      delete: "btn btn-sm btn-link p-0 pl-2",
    },
  }),
]);

search.start();

document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  
  const searchBox = document.querySelector('#searchbox');
  if (searchBox) {
    searchBox.style.display = 'block';
  }
});

const updateThemeIcon = (theme) => {
  const toggleBtn = document.getElementById('theme-toggle');
  const moonIcon = toggleBtn.querySelector('.fa-moon');
  const sunIcon = toggleBtn.querySelector('.fa-sun');
  
  if (theme === 'dark') {
    moonIcon.style.display = 'inline-block';
    sunIcon.style.display = 'none';
  } else {
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'inline-block';
  }
};

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
};

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);
  
  document.getElementById('theme-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
});

document.querySelectorAll('.clickable-search-term').forEach(term => {
  term.addEventListener('click', (e) => {
    e.preventDefault();
    const searchTerm = e.target.textContent;
    const searchInput = document.querySelector('.ais-SearchBox-input');
    searchInput.value = searchTerm;
    const event = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(event);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const hideAboutBtn = document.getElementById('hide-about');
  hideAboutBtn.addEventListener('click', () => {
    $(".row.mb-5").addClass("d-none");
  });
});

const fetchStats = (() => {
  let statsPromise = null;
  
  return async () => {
    if (!statsPromise) {
      statsPromise = fetch(`${process.env.TYPESENSE_PROTOCOL}://${process.env.TYPESENSE_HOST}:${process.env.TYPESENSE_PORT}/collections/database_stats/documents/search`, {
        method: 'POST',
        headers: {
          'X-TYPESENSE-API-KEY': TYPESENSE_SERVER_CONFIG2.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'q': '*',
          'per_page': 1
        })
      })
      .then(response => response.json())
      .then(data => {
        const count = data.found; 
        document.querySelectorAll('.total-writeups-count').forEach(el => {
          el.textContent = count.toLocaleString();
        });
        return count;
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
      });
    }
    return statsPromise;
  };
})();
