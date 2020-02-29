(function(window, $) {
  function itemTemplate(item) {
    var star = '';
    for (var i = 0; i < item.rate; i++) {
      star += '<img src="../../img/others/star_checked.png">';
    }
    console.log(item);

    return `<li class="list-group-item even" style="display, list-item;">
        <h3 class="title red"><a href="${item.link}">${item.modulename}</a></h3>
        <div class="breadcramb">
            <a href="#" class="family_link" rel="${item.familyShortId}">${item.family}</a> &gt; <a href="#" class="category_link" rel="${item.categoryShortId}">${item.categoryName}</a>
        </div>

        <div class="info">
            <p>${item.description}</p>
            <div class="status">
                <span class="rating">
                    <input type="hidden" value="${item.rate}">
                    ${star}
                </span>
            </div>
        </div>
    </li>`;
  }

  function resolveURI(key) {
    key = key.toLowerCase();
    const pageKeywords = ['pages', 'pages', 'content'];
    if (pageKeywords.join(' ').match(key)) {
      return '../../data/page.json';
    }
    const authKeywords = [
      'auth',
      'login',
      'signin',
      'signup',
      'authorization',
      'authentication',
    ];
    if (authKeywords.join(' ').match(key)) {
        return '../../data/auth.json';
    }

    const chatKeywords = ['chat', 'csr chat module'];
    if (chatKeywords.join(' ').match(key)) {
      return '../../data/chat.json';
    }

    const searchKeywords = ['search', 'custom field search', 'custom search'];
    if (searchKeywords.join(' ').match(key)) {
        return '../../data/search.json';
    }
    return '';
  }

  function renderData(data, err) {
    const mainContainer = $('#mainContent');
    let template = '';
    if (err) {
      template = '<h3>No results found, try with another keyword</h3>';
    } else {
      template = `<ul class="list-group">
            <div class="main_page_signin">
            <h3>Filter results</h3>
            <p>Showing ${data.more.itemsOnPage} of ${data.more.total}</p>
            </div>
                ${data.more && data.more.items.map(itemTemplate).join('')}
            </ul>`;
    }
    mainContainer.empty();
    mainContainer.append(template);
  }

  window.loadJson = function(keyWord) {
    window
      .fetch(resolveURI(keyWord))
      .then(
        res => res.json(),
        err => renderData(null, true),
      )
      .then(renderData, err => renderData(null, true));
  };
})(window, jQuery);
