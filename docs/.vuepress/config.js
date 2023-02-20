module.exports = {
    title: 'Homepage',
    // base: '/vuepress/',
    description: 'Crane\' Homepage',
    head: [
        ['link', { rel: 'icon', href: '/img/logo.ico' }],
    ],
    port: 80,
    markdown: {
	    lineNumbers: true, // 代码显示行号
        extendMarkdown: md => {
            md.set({ breaks: true })
            md.use(require('markdown-it-footnote'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-task-lists'),{
                    enabled: true,
                }
                )
                .use(require('@neilsustc/markdown-it-katex'))
                .use(require('markdown-it-attrs'), {
                    leftDelimiter: '{{',
                    rightDelimiter: '}}',
                    allowedAttributes: ['id', 'class']
                })
        },

    },
    themeConfig: {
        sidebar: "auto",
        nav: [
            { text:'首页', link: '/'},
            {
                text: '博文',
                items: [
                    { text: 'notes', link: '/notes/' },
                ]
            }, 
            { text:'关于', link: '/about/'},
            { text: 'Github', link: 'https://github.com/junkanghu/' }
        ],
        // sidebar: {
        //     '/notes/': [
        //         {
        //             title: 'project',
        //             collapsable: false,  // 是否可折叠，默认可折叠true 
        //             children: [
        //                 "project/Lumos"
        //             ]
        //         },
        //         {
        //             title: 'paper',
        //             collapsable: false,  // 是否可折叠，默认可折叠true 
        //             children: [
        //                 // "python1",
        //                 // "python2",
        //                 // "python3"
        //             ]
        //         },
        //         {
        //             title: 'Python Web',
        //             collapsable: false,
        //             children: [
        //                 "python4",
        //                 "python5",
        //                 "python6"
        //             ]
        //         },
        //     ],

        //     // '/Notes/ubuntu': [
        //     //     {
        //     //         title: 'Ubuntu',
        //     //         collapsable: false,  // 是否可折叠，默认可折叠true 
        //     //         children: [
        //     //             // "python1",
        //     //             // "python2",
        //     //             // "python3"
        //     //         ]
        //     //     },
        //     // ],

        //     '/golang/': [
        //         "",
        //         "golang1",
        //         "golang2",
        //         "golang3"
        //     ],
        //     '/web/': [
        //         "",
        //         "web1"
        //     ],
        // },
        sidebarDepth: 2, // 侧边栏显示深度，默认为1，即显示一级标题
    }
}
