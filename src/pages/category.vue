<template>
  <f7-page name="主菜食譜">
    <f7-navbar title="主菜食譜" back-link="Back"></f7-navbar>
    <f7-block>
      <img src="/assets/images/category.jpg" alt="" srcset="">
      Photo by <a href="https://unsplash.com/@therachelstory?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rachel Park</a> on <a href="https://unsplash.com/photos/hrlvr2ZlUNk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      <br>
      <br>
      <div class="recipe-category">
        <h2>紅酒燴牛肉</h2>
        <p>用紅酒和香料慢慢燉煮的牛肉，肉質鮮嫩，帶有濃郁的紅酒風味。</p>
        <h2>香烤雞腿</h2>
        <p>經過特製的香料調味，雞腿在烤箱中烤至金黃酥脆，外脆內嫩。</p>
        <h2>海鮮意大利麵</h2>
        <p>混合了蝦、蟹肉和貝類的海鮮意大利麵，海鮮的鮮味與麵食的濃郁交相融合。</p>
    </div>
    </f7-block>
  </f7-page>
</template>
<style lang="scss">
.recipe-category {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}
h1 {
    text-align: center;
    color: #333;
}
h2 {
    color: #555;
}
ul {
    list-style-type: disc;
    padding-left: 20px;
}
</style>
