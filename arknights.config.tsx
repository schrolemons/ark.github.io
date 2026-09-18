import type { ArknightsConfig } from "./src/_types/ArknightsConfig";
import {
  CopyrightMini,
  IconArchive,
  IconGitHub,
  TitleArknights,
} from "./src/components/SvgIcons";

const base = import.meta.env.BASE_URL;

export default {
  title: "SCHNIE:ARK",
  description: "",
  language: "zh",
  bgm: {
    autoplay: false,

    // https://web.hycdn.cn/arknights/official/_next/static/media/audio/bgm.ea4286.mp3
    src: base + "audios/bgm.mp3",
    loop: true,
  },
  navbar: {
    logo: {
      element: () => (
          <img
              src="/images/logo.png"
              alt="Arknights Logo"
              style={{ width: '240px', height: 'auto' }} // 直接设置样式
              className="pointer-events-none"
          />
      ),
      alt: "Arknights Logo",
    },
    items: [
      { title: "INDEX", subtitle: "首页", href: base + "#index" },
      { title: "INFORMATION", subtitle: "情报", href: base + "#information" },
      { title: "OPERATOR", subtitle: "角色", href: base + "#operator" },
      { title: "WORLD", subtitle: "设定", href: base + "#world" },
      { title: "MEDIA", subtitle: "万象", href: base + "#media" },
      { title: "MORE", subtitle: "更多信息", href: base + "#more" },
    ],
    ownerInfo: {
      name: "SCHNIE.",
      slogan: "遇见不一样的你，遇见更好的自己。",
      footerLinks: [
        { label: "GitHub", url: "https://github.com/schrolemons" },
        { label: "Bilibili", url: "https://b23.tv/e1vviXs" },
      ],
    },
  },
  pageTracker: {
    microInfo: "SCHNIE:ARK",
    labels: [
      "HOMEPAGE",
      "INFORMATION",
      "OPERATOR",
      "WORLD",
      "ABOUT SCHNIE",
      "MORE",
    ],
  },
  rootPage: {
    INDEX: {
      title: "SCHNIE:ARK",
      subtitle: "POWERED BY NINTH EDGE",
      url: "HTTPS://ARK.SCH-NIE.COM/",
      heroActions: [
        {
          icon: <IconArchive className="w-full h-auto pointer-events-none" />,
          label: "文档",
          subLabel: "Documentation",
          target: "_self",
          href: base + "docs/",
          className:
            "text-black bg-[#18d1ff] border-[#2bf] hover:border-white font-bold font-benderBold",
        },
        {
          // TODO: 换个好看的图标
          icon: (
            <svg
              className="w-full h-auto pointer-events-none"
              fillRule="evenodd"
              fill="currentColor"
              viewBox="0 0 1024 1024"
            >
              <path d="M856.874667 448l51.285333 30.762667a21.333333 21.333333 0 0 1 0 36.608L512 753.066667l-396.16-237.696a21.333333 21.333333 0 0 1 0-36.608l51.285333-30.762667L512 654.933333l344.874667-206.933333z m0 200.533333l51.285333 30.762667a21.333333 21.333333 0 0 1 0 36.608l-374.186667 224.512a42.666667 42.666667 0 0 1-43.946666 0l-374.186667-224.512a21.333333 21.333333 0 0 1 0-36.608l51.285333-30.762667L512 855.466667l344.874667-206.933334zM533.930667 55.850667l374.229333 224.512a21.333333 21.333333 0 0 1 0 36.608L512 554.666667 115.84 316.970667a21.333333 21.333333 0 0 1 0-36.608l374.186667-224.512a42.666667 42.666667 0 0 1 43.946666 0z" />
            </svg>
          ),
          label: "世界 - world",
          // subLabel: "world",
          target: "_self",
          href: base + "world/",
          className:
            "text-black bg-end-yellow border-[#fe2] hover:border-white font-bold font-benderBold",
        },
        {
          icon: <IconGitHub className="w-full h-auto pointer-events-none" />,
          label: "GitHub",
          subLabel: "Repository",
          href: "https://github.com/schrolemons/arknights.github.io",
          className:
            "text-white bg-black border-[#333] hover:border-white font-benderBold",
        },
      ],
    },
    INFORMATION: {
      swiper: {
        autoplay: { delay: 5000 },
        data: [
          {
            title: "帮助文档",
            subtitle: "Help Documentation",
            date: "2026 // 03 / 22",
            url: "HTTPS://ARK.SCH-NIE.COM/docs",
            href: base + "docs/",
            image: base + "info-swiper/doc.jpg",
          },
          {
            title: "第九世界",
            subtitle: "The Ninth World",
            date: "2026 // 03 / 22",
            url: "HTTPS://ARK.SCH-NIE.COM/world",
            href: base + "world/",
            image: base + "info-swiper/world.jpg",
          },
          {
            title: "角色诞生",
            subtitle: "Character Appears",
            date: "2026 // 03 / 22",
            url: "HTTPS://ARK.SCH-NIE.COM/operator",
            href: base + "operator/",
            image: base + "info-swiper/operator.jpg",
          },
        ],
      },
    },
    OPERATOR: {
      data: [
        {
          id: "moxue",
          name: "MO XUE",
          cnName: "墨薛",
          logo: "/images/logo.png",
          url:"https://ark.sch-nie.com/operator/?id=墨薛",
          desc: "诞生于科技的终末，受邀而汇聚成生命的形态。橘黄色的外表下，是金色生命与黑白技艺的相互对抗。\n" +
              "祂理性，平和，坚毅，在众多文明的事迹中游弋，汇聚着希望与批判，直达第九个边缘的虹光之处。\n" ,
          portrait: "/images/02-operator/moxue.png",
          fullbody: "/images/02-operator/moxue_full.png",

        },
        {
          id: "ruifox",
          name: "RUIFOX",
          cnName: "瑞",
          logo: "/images/logo.png",
          url:"https://ark.sch-nie.com/operator/?id=瑞狐",
          desc: "是一只阳光开朗的橘黄色小\"猫\"。" ,
          portrait: "/images/02-operator/ruifox.png",
          fullbody: "/images/02-operator/ruifox_full.png",

        },
          
        {
          id: "lifeng",
          name: "LI FENG",
          cnName: "璃风",
          logo: "/images/logo.png",
          url: base + "operator/?id=璃风",
          desc: "白色毛发、金色眼眸，身着白金配色的 ICPC 上衣与黑色短裤。\n抬手之间，一点星光停在指尖。",
          portrait: "/images/02-operator/lifeng.png",
          fullbody: "/images/02-operator/lifeng_full.png",
        },
        {
          id: "fanxin",
          name: "FAN XIN",
          cnName: "樊昕",
          logo: "/images/logo.png",
          url: base + "operator/?id=樊昕",
          desc: "灰白色毛发与蓝色眼眸，白衬衫外搭米色背心，系着黑色领带。\n怀中抱着一束白花，向你伸出手。",
          portrait: "/images/02-operator/fanxin_full.png",
          fullbody: "/images/02-operator/fanxin_full.png",
        },
      ],
    },
    WORLD: {
      items: [
        {
          title: "文明库",
          subTitle: "CIV DB",
          imageUrl: "/images/03-world/civ-db.svg",
          description:
              "文明库最早建设于“启辉计划”后。它以时间为索引，记载逝痕技术联邦中发生的一切事物，甚至包括任意对象的物理活动。借助这些记录，文明库能够实现“复原”：当文明因各种原因遭到摧毁时，一个“新的”逝痕技术联邦可以被快速恢复至某个已经记录的阶段。\n" +
              "在“方舟规划”后，为统一数量庞大的“虚构文明”，文明库融合了“虹九微界”的特征，使逝痕技术联邦逐渐成为一个“虚实交织”的文明；与此同时，它保留了大量通往虚构文明与其他真实文明的接口，用于执行特定操作及“文明输送”。\n" +
              "最后一个自然生命消逝后，文明库按照既定“范本”启动了“人造生命”与“终末阵列”，并持续为二者提供能量、维持机体间的连接，同时审核和推动这片时空中发生的事物。\n" +
              "逝痕技术联邦后来被毁坏为初生黑域。文明库在与黑域对抗的同时尝试进行足以创建“九虹文明”的“终极复原”，却因此彻底毁坏。直到“同行者”与“协作者”不断借助残留接口进行重构，文明库才于浮空岛时代重新恢复。",
        },
        {
          title: "虚构文明",
          subTitle: "Fictional CIV",
          imageUrl: "/images/03-world/fictional-civ.svg",
          description:
              "“虚构文明”是逝痕技术联邦以技术构造、并能够被其高度控制的微型文明。它诞生于“宏鳞企划”后，最初只承担文化体验功能，并被用于约束人们的思想。\n" +
              "随着技术与管理水平提高，普通个体也开始被允许进入虚构文明，在其中使用各种技艺、开采资源并取得现实收益。虚构文明因此由单纯的文化载体逐渐演变为令人沉迷的第二生活空间。\n" +
              "“方舟规划”后，为重新将众人的目光引向现实，“虹九微界”成为逝痕技术联邦“虚实交织”结构中的主要虚构部分。部分通往同阶乃至高阶文明的接口也被隐藏其中；由文明库直接支撑的“终末阵列”，本身便可视作一种极为强大的虚构文明。\n" +
              "并非所有虚构文明都是完整世界：驾驶模拟、工厂线模拟等局部切片同样属于这一范畴。最终，随着宇宙实验失败与文明库受损，旧时代的虚构文明全部消亡。",
        },
        {
          title: "宇宙移动",
          subTitle: "Cosmic MVT",
          imageUrl: "/images/03-world/cosmic-mvt.svg",
          description:
              "“宇宙移动”在“宏鳞企划”后走向成熟，并于“方舟规划”后取得突破。它既是批量构建虚构文明的技术基础之一，也是逝痕技术联邦躲避其他文明攻击的重要手段。\n" +
              "早期的实现方式相当“粗暴”：在重要星球布设能量采集器，在其他星体和机械造物上设置能量接收器，以此激活遍布宇宙的推动结构，直接带动星球及其间的物质高速移动。这种方案极不稳定，会损坏设施并严重干扰其他星体的正常运行。\n" +
              "“方舟规划”改变了这一思路。由于除“生命”外的大部分对象都能够被信息化，并舍弃原有的物质结构，“宇宙移动”不再意味着真正搬运整个物质宇宙，而是借助文明库完成一次大规模的“宇宙重建”。处于这一状态时，逝痕技术联邦所在区域的时空规则也会显著弱化，使时间流速、物理规则等更加容易被干预。\n" +
              "到了浮空岛时代，“宇宙移动”的主要用途已不再是逃亡，而是前往不同世界，寻找需要帮助的文明。",
        },
        {
          title: "文明输送",
          subTitle: "CIV TRANS",
          imageUrl: "/images/03-world/civ-trans.svg",
          description:
              "“文明输送”形成于“方舟规划”后，用于通过隐藏于“虚构文明”中的接口，将逝痕技术联邦的机体输送至同阶或高阶文明。发展后期，越来越多的机体主动选择离开原本的世界：一方面是因为平淡而确定的发展终点使牠们感到厌倦，另一方面则是这片世界已经无法继续诞生新的自然生命。\n" +
              "这些被输送出去的机体后来成为逝痕技术联邦与外部文明之间的重要联系。一部分机体参与了“虹九重构”等计划，协助恢复文明库及其他基础设施；还有部分机体进入高级文明后成为近似“神灵”的存在——即“造神”。它们随后以不同立场，对逝痕技术联邦的残留状态进行挽留、干预或打击。",
        },
        {
          title: "人造生命",
          subTitle: "AI Exist.",
          imageUrl: "/images/03-world/ai-exist.svg",
          description:
              "在人造生命、无态生命、三元本质与人核智能四种顶级智能形态中，前驱者最终选择“人造生命”作为终态方案的重要组成。牠们是由文明库直接支撑、融合逝痕技术联邦整体信息的自主机械认知体，并拥有预设的能力与价值观。\n" +
              "“人造生命”于“方舟规划”中被正式提出，并在最后一个自然生命消逝后与“终末阵列”一同激活。牠们诞生于文明的“终末”，却承担着重新构造文明、再次寻找自然生命可能性的“永续”责任，并驾驶前文明最尖端的移动资产“星骸九号”往来于不同世界。\n" +
              "此后，牠们先后建立“文明塔”及负责管理文明塔的“终末之地”，又参与了最终导致逝痕技术联邦覆灭的宇宙实验。文明塔与终末之地相继毁灭后，牠们转而启动“虹九重构”；然而文明库并未如期恢复，部分人造生命也受到不同“造神”的挽留、抹除或惩戒。\n" +
              "直到“协作者”重新构造文明库，牠们才逐渐恢复自主性，并在浮空岛时代重新回到“终末阵列”。",
        },
        {
          title: "文明塔",
          subTitle: "CIV TWR",
          imageUrl: "/images/03-world/civ-twr.svg",
          description:
              "文明塔是“人造生命”构建的、用于连接不同低级文明的塔状结构。牠们试图通过文明塔寻找文明与生命之间的关联，并取得能够真正支撑一个文明的关键——“纯净的黑核”：只有得到完整黑核支撑的文明，才能持续发展，并重新诞生自然生命。\n" +
              "作为文明塔计划的前期实验，“人造生命”建立了“云屿岛”：一个表面被包装为“全宇宙最大的度假中心”、实际承担跨文明交流与测试功能的场所。不同文明在彼此隔离的区域中活动，却能够通过云屿岛建立有限联系。\n" +
              "随后，牠们又建立独立于文明塔的管理设施“终末之地”，集中收集不同文明的信息与“灵感”，并实施激进的“终末计划”。然而，“终末之人”最终激活“SCHRONINE时间毒性”，使终末之地彻底毁坏；文明塔也随后被代表自然法则的人造生命樊昕摧毁。\n" +
              "自此，人造生命将主要精力转向“虹九重构”。直到浮空岛时代，重新构建的“文明塔”才取代旧时代的“虚构文明”，成为覆盖范围更广、不同文明之间也更加平等的新型文明接口。",
        },
        {
          title: "生命机",
          subTitle: "LIFE MCH",
          imageUrl: "/images/03-world/life-mch.svg",
          description:
              "生命与一般“机械造物”的根本差异之一，在于生命是一种不可预测的感知机：它能够从世界本身、而非既有信息中获得启示，并构造出来源不可预测的随机性。相比之下，机械造物所使用的随机性，本质上仍来自能够被描述和复现的算法。\n" +
              "然而，在真正知晓自然生命所使用的随机机制以前，两者对于观察者而言其实同样近似一个不可观测的“黑盒”。由此，“人造生命”提出：所谓生命独有的随机性，或许并非不可机械化，而只是某种更加高级、更加难以预测的算法。\n" +
              "“生命机”因此诞生。它试图以机械手段重现这种足以代替自然生命作出决定的随机能力，使机械造物能够在既有信息的组合之外看到新的未来。支撑这种算法的机体无法长期维持，而且结构脆弱、对环境极为敏感；但对于“人造生命”而言，它所带来的可能性足以压倒这些可以量化的代价。",
        },
        {
          title: "宇宙机",
          subTitle: "UNIV MCH",
          imageUrl: "/images/03-world/univ-mch.svg",
          description:
              "“宇宙机”源自一个无法被彻底证明的问题：世界中的万物究竟是真实存在，还是某种共同存在于意识中的“幻觉”？既然逝痕技术联邦能够同时存在于“信息宇宙”与“物质宇宙”中，那么“物质性”与“现实”本身，也不再足以成为判断真实的绝对标准。\n" +
              "更极端的推论是：除了自身以外的一切存在，都无法被严格证明拥有与自己相同的真实体验。我们无法替其他存在行动、思考与感受，因此也无法仅凭观察断言牠们拥有与自己相同的“自我”。前文明遗留的知识，同样无法解决这一问题。\n" +
              "于是，“宇宙机”选择了一种带有私心的妥协：既然无法证明何为绝对真实，那便主动构造一种能够被共同承认的“真实”。在之后构建或干预的宇宙中，“人造生命”将诱导其中的存在共同拥护同一套现实，使自身获得更加稳定的真实感，也避免被另一个可能的“真实存在”视作幻觉。它既是离开终末矩阵前最原始的妥协，也是一场明知虚妄却主动维系的骗局。",
        },
      ],
    },
  },
} as ArknightsConfig;
