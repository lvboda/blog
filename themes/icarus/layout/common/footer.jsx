const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Footer extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            siteYear,
            author,
            links,
            showVisitorCounter,
            visitorCounterTitle
        } = this.props;

        let footerLogo = '';
        if (logo) {
            if (logo.text) {
                footerLogo = logo.text;
            } else {
                footerLogo = <img src={logoUrl} alt={siteTitle} height="28" />;
            }
        } else {
            footerLogo = siteTitle;
        }

        return <footer class="footer">
            <div class="container">
                <div class="level">
                    <div class="level-start">
                        <a class="footer-logo is-block mb-2" href={siteUrl}>
                            {footerLogo}
                        </a>
                        <p class="is-size-7">
                            <span dangerouslySetInnerHTML={{ __html: `&copy; ${siteYear} ${author || siteTitle}` }}></span>

                            {showVisitorCounter ? <br /> : null}
                            {showVisitorCounter ? <span id="busuanzi_container_site_uv"
                                dangerouslySetInnerHTML={{ __html: visitorCounterTitle }}></span> : null}
                            
                            <br/>
							<span id="timeDate">载入天数...</span><span id="times">载入时分秒...</span>
							<script dangerouslySetInnerHTML={{
								__html: `
								var now = new Date();
								function createtime() {
									var grt= new Date("11/10/2022 00:00:00");//此处修改你的建站时间或者网站上线时间
									now.setTime(now.getTime()+250);
									days = (now - grt ) / 1000 / 60 / 60 / 24; dnum = Math.floor(days);
									hours = (now - grt ) / 1000 / 60 / 60 - (24 * dnum); hnum = Math.floor(hours);
									if(String(hnum).length ==1 ){hnum = "0" + hnum;} minutes = (now - grt ) / 1000 /60 - (24 * 60 * dnum) - (60 * hnum);
									mnum = Math.floor(minutes); if(String(mnum).length ==1 ){mnum = "0" + mnum;}
									seconds = (now - grt ) / 1000 - (24 * 60 * 60 * dnum) - (60 * 60 * hnum) - (60 * mnum);
									snum = Math.round(seconds); if(String(snum).length ==1 ){snum = "0" + snum;}
									document.getElementById("timeDate").innerHTML = " 本站已运行 "+dnum+" 天 ";
									document.getElementById("times").innerHTML = hnum + " 小时 " + mnum + " 分 " + snum + " 秒";
								}
								setInterval("createtime()",250);
								`,
							}}
							/>
                            
                            <br />
                                <a href="mailto:lvboda.cn@gmail.com">lvboda.cn@gmail.com</a>
                            <br/>
                                <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener">辽ICP备2022007649号-2</a>
                            <br/>
                                <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=21090402210935" target="_blank" rel="noopener">辽公网安备 21090402210935号</a>
                        </p>
                    </div>
                    <div class="level-end">
                        {Object.keys(links).length ? <div class="field has-addons">
                            {Object.keys(links).map(name => {
                                const link = links[name];
                                return <p class="control">
                                    <a class={`button is-transparent ${link.icon ? 'is-large' : ''}`} target="_blank" rel="noopener" title={name} href={link.url}>
                                        {link.icon ?
                                            (Array.isArray(link.icon) ?
                                                link.icon.map(i => [<i className={i}></i>, '\u00A0']) :
                                                <i className={link.icon}></i>
                                        ) : name}
                                    </a>
                                </p>;
                            })}
                        </div> : null}
                    </div>
                </div>
            </div>
        </footer>;
    }
}

module.exports = cacheComponent(Footer, 'common.footer', props => {
    const { config, helper } = props;
    const { url_for, _p, date } = helper;
    const { logo, title, author, footer, plugins } = config;

    const links = {};
    if (footer && footer.links) {
        Object.keys(footer.links).forEach(name => {
            const link = footer.links[name];
            links[name] = {
                url: url_for(typeof link === 'string' ? link : link.url),
                icon: link.icon
            };
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        siteYear: date(new Date(), 'YYYY'),
        author,
        links,
        showVisitorCounter: plugins && plugins.busuanzi === true,
        visitorCounterTitle: _p('plugin.visitor_count', '<span id="busuanzi_value_site_uv">0</span>'),
		visitCounterTitle: _p('plugin.visit_count_total', '<span id="busuanzi_value_site_pv">0</span>')
    };
});
