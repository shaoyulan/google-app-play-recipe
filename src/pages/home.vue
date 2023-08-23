<template>
  <f7-page name="home">
    <!-- Top Navbar -->
    <f7-navbar >
      <f7-nav-left>
      </f7-nav-left>
      <f7-nav-title>食譜APP</f7-nav-title>
      <f7-nav-right>
      </f7-nav-right>
    </f7-navbar>
    <!-- Toolbar-->
    <f7-toolbar bottom>
      <f7-link href="/category/">類別</f7-link>
      <f7-link href="/today/">當日</f7-link>
    </f7-toolbar>
    <!-- Page content-->
    <f7-block>
      <img src="/assets/images/home-food.jpg" alt="" srcset="">
      Photo by <a href="https://unsplash.com/@lvnatikk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Lily Banse</a> on <a href="https://unsplash.com/photos/-YHSwy6uqvk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      <p>
        當您正在尋找烹飪靈感時，食譜APP是您的最佳選擇。我們提供了豐富多樣的食譜，從甜點到主菜，應有盡有。
      </p>
      <p>
        每道食譜都附有詳細的步驟指南和高清圖片，即使是初學者也能輕鬆上手。不僅如此，我們還為您生成購物清單，讓購物變得更加便捷。
      </p>
      <p>
        內建的計時器可助您掌握烹飪時間，讓每道菜品都完美烹調。您還可以加入我們的廚藝社區，與其他美食愛好者交流心得，分享烹飪秘訣。
      </p>
      <p>
        不管您是想探索全球美食還是提升廚藝技能，食譜APP都將是您的最佳夥伴。馬上下載，開啟美食之旅吧！
      </p>
    </f7-block>
    <f7-block-title>主題導覽</f7-block-title>
    <f7-list strong inset dividersIos>
      <f7-list-item link="/today/" title="當日特色食譜"></f7-list-item>
      <f7-list-item link="/category/" title="主菜食譜"></f7-list-item>
    </f7-list>
  </f7-page>
</template>
<style lang="scss">

</style>