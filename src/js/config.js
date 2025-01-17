(function (PLUGIN_ID) {
  const formEl = document.querySelector('.js-submit-settings');
  const cancelButtonEl = document.querySelector('.js-cancel-button');
  const inputEl = document.querySelector('.js-channel-access-token');
  if (!(formEl && cancelButtonEl && inputEl)) {
    throw new Error('必要なフィールドが存在しません。');
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    kintone.plugin.app.setProxyConfig(
      'https://api.line.me',
      'POST',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inputEl.value}`,
      },
      {},
      () => {
        window.location.href = '../../flow?app=' + kintone.app.getId();
      },
    );
  });

  cancelButtonEl.addEventListener('click', () => {
    window.location.href = '../../' + kintone.app.getId() + '/plugin/';
  });
})(kintone.$PLUGIN_ID);
