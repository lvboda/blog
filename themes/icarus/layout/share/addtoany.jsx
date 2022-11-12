const { Component, Fragment } = require("inferno");

module.exports = class extends Component {
  render() {
    return (
      <Fragment>
        <div
          class="a2a_kit a2a_kit_size_32 a2a_default_style"
          data-a2a-url="https:lvboda.cn/blog/"
          data-a2a-title="Boda's blog"
        >
          <a class="a2a_dd" href="https://www.addtoany.com/share"></a>
          <a class="a2a_button_wechat"></a>
          <a class="a2a_button_sina_weibo"></a>
          <a class="a2a_button_qzone"></a>
          <a class="a2a_button_twitter"></a>
          <a class="a2a_button_facebook"></a>
        </div>
        <script>
          var a2a_config = a2a_config || {}; a2a_config.locale = "zh-CN";
          a2a_config.num_services = 4;
        </script>
        <script async src="https://static.addtoany.com/menu/page.js"></script>
      </Fragment>
    );
  }
};
