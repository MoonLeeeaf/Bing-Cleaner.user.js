// ==UserScript==
// @name         必应净化
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      1.6.1
// @description  移动端 bing 使用优化, 使用前请查阅代码注释
// @author       月有阴晴圆缺
// @run-at       document-start
// @include        *://*.bing.com/search*
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.js
// ==/UserScript==

/*
 * 1.6.1 - fix: 带特殊字符的搜索关键词
 */

/*
 * 本脚本需要搭配 ADBlock/ADGuard/... 配合使用
 * 并且只为移动端编写
 * 
 * 由于本人的浏览器环境特别乱, 因此无法保证全部功能搬到其他浏览器正常
 * 
 * 功能列表:
 * 删除 打开App 底部对话框
 * 去除 bd 广告
 * 屏蔽指定关键词网站名称搜索结果
 * 为添加上一页和下一页
 */

/* 

 Via 广告拦截 屏蔽列表

.bing.com###mfa_root
.bing.com###inline_rs
.bing.com###bnp_rich_div
.bing.com##.sacs_overlay
.bing.com##.b_ad
.bing.com##.ad_sc
.bing.com##.ad_Top
.bing.com###bnp.nid.63693
.bing.com/rp/*
.bing.com##div.adrfloat
.bing.com##.bnp_rich_div_visible
||r.bing.com^

*/

/*
 真正的下一页:
 Parent: <div role="navigation" class="b_mpref">

 <a class="sb_fullnpl" title="下一页" href="/search?q=%22fwasshing%22&amp;FPIG=D7F01B2BA1FE4936ACC01F5BB466A7BD&amp;first=2&amp;FORM=PORE" h="ID=SERP,5230.1"><span><div class="b_nextText b_primtxt">下一页</div></span><span><div class="sb_pagIconN sb_pI_noRot " aria-hidden="true"><span class="sw_next" aria-hidden="true">下一页</span></div></span></a>
 */

; (function () {
    for (let i = 0; i < 20; i++) {
        try {
            $('.b_ad').remove()
        } catch (e) { }
    }

    // 其他的东西

    for (let i = 0; i < 100; i++) {
        try {
            $('#bnp_rich_div').remove()
        } catch (e) { }
        try {
            $("#inline_rs").remove()
        } catch (e) { }
        try {
            $('a').attr('_ctf', null)
        } catch (e) { }
    }

    // 强制显示内容

    for (let i = 0; i < 10; i++) {
        try {
            $('#b_content').css('visibility', '')
        } catch (e) { }
    }

    function fuck() {
        // 净化搜索结果
        try {
            $('a[aria-label] > .tptxt > .tptt').filter(function () {
                let title = $(this).text()
                if (new RegExp(localStorage.屏蔽规则, 'g').test(title)) {
                    $(this.parentNode.parentNode.parentNode.parentNode).remove()
                }
            })
        } catch (e) { }
    }

    // 新的页面没有了下一页
    // 那我来做吧
    // 现在不会没有下一页了

    $(function () {
        if (document.body.childNodes.length < 5) location.reload()
        // 2025.3.28: bing已经不认塞班UA了 下一页依旧要自己补
        // 2025.4.12: 关键词带 " 会有下一页

        const args = new URL(location.href).searchParams

        let first = args.get('first')

        let ls = $('.b_algo').length

        if (first == null) first = 0

        first = parseInt(first)

        let clazz = 'b_searchBoxForm'

        if (first > 0) {
            let syy = `https://www.bing.com/search?q=${encodeURIComponent(args.get('q'))}&first=${first - (ls * 2)}&FORM=PORE`
            $($.parseHTML(`<div role="presentation" class="b_algo _切页面" style="background: #FFFFFF; text-align:center;" data-href="${syy}">上一页</div>`)).appendTo($('#b_results'))
        }

        first = first == 0 ? ls : first + ls

        let xyy = `https://www.bing.com/search?q=${encodeURIComponent(args.get('q'))}&first=${first}&FORM=PORE`

        $($.parseHTML(`<div role="presentation" class="b_algo _切页面" style="background: #FFFFFF; text-align:center;" data-href="${xyy}">下一页</div>`)).appendTo($('#b_results'))

        if (localStorage.屏蔽规则 == null || localStorage.屏蔽规则 == "" || localStorage.屏蔽规则 == "null") {
            localStorage.屏蔽规则 = "(CSDN文库|xmdos)"
        }

        $('._切页面').click(function () {
            location.href = $(this).attr('data-href')
        })

        fuck()

        for (let i = 0; i < 200; i++) {
            try {
                $('#bnp_rich_div').remove()
            } catch (e) { }
            try {
                $("#inline_rs").remove()
            } catch (e) { }
            try {
                $('a').attr('_ctf', null)
            } catch (e) { }
        }

        $($.parseHTML(`<div role="presentation" class="b_algo _修改屏蔽规则" style="background: #FFFFFF; text-align:center;">点击修改屏蔽规则</div>`)).appendTo('#b_results')

        $('._修改屏蔽规则').click(function () {
            let a = window.prompt('修改屏蔽规则，输入正则...', localStorage.屏蔽规则)
            if (a) {
                localStorage.屏蔽规则 = a
                window.via.toast("保存屏蔽规则成功！刷新网页以令其生效")
            }
        })
    })

    fuck()
})()
