import Swal from 'sweetalert2';

(function (PLUGIN_ID) {
  kintone.events.on('app.record.detail.show', () => {
    const sendButton = document.createElement('button');
    sendButton.textContent = 'メッセージ送信';
    sendButton.className = 'kintoneplugin-button-dialog-ok';
    sendButton.style = 'margin:16px 0 0 16px';
    sendButton.onclick = showAlert;

    const headerMenuSpace = kintone.app.record.getHeaderMenuSpaceElement();
    headerMenuSpace.appendChild(sendButton);
  });

  /**
   * メッセージ送信アラート表示
   */
  const showAlert = () => {
    Swal.fire({
      title: 'LINEメッセージ送信',
      text: '送信するメッセージを入力してください。',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'キャンセル',
      confirmButtonText: '送信',
      preConfirm: async (message) => {
        // 入力チェック
        if (message === '') {
          Swal.showValidationMessage('メッセージを入力してください。');
          return;
        }
        try {
          const { record } = kintone.app.record.get();
          const userId = record['LINEユーザーID'].value;
          await sendMessage(userId, message);
          await createHistory(userId, message);
        } catch (error) {
          console.error(error);
          Swal.showValidationMessage('メッセージの送信に失敗しました。');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '送信完了',
          text: 'メッセージが送信されました。',
          icon: 'success',
        }).then(() => location.reload());
      }
    });
  };

  /**
   * LINEにメッセージ送信
   */
  const sendMessage = async (userId, message) => {
    const [, status] = await kintone.plugin.app.proxy(
      PLUGIN_ID,
      'https://api.line.me/v2/bot/message/push',
      'POST',
      {},
      {
        to: userId,
        messages: [{ type: 'text', text: message }],
      },
    );
    if (status !== 200) {
      throw new Error('メッセージの送信に失敗しました。');
    }
  };

  /**
   * メッセージ履歴の登録
   */
  const createHistory = async (userId, message) => {
    const appId = kintone.app.getRelatedRecordsTargetAppId('メッセージ履歴');
    await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', {
      app: appId,
      record: {
        LINEユーザーID: { value: userId },
        送信メッセージ: { value: message },
      },
    });
  };
})(kintone.$PLUGIN_ID);
