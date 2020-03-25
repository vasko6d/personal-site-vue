<template>
  <div id="footer-links">
    <a href="https://github.com/vasko6d" target="_blank" class="icn">
      <i class="fab fa-github fa-2x"></i>
    </a>
    <a
      href="https://www.linkedin.com/in/david-vasko-968726106/"
      target="_blank"
      class="icn"
    >
      <i class="fab fa-linkedin fa-2x"></i>
    </a>
    <!--a href="https://stackexchange.com/users/15465303/vasko6d" >
			<i class="fas fa-stack-overflow fa-2x"></i>
			</i>
    </a-->
    <a href="https://www.hackerrank.com/vasko6d" target="_blank" class="icn">
      <i class="fab fa-hackerrank"></i>
    </a>
    <a href="https://www.instagram.com/vasko6d/" target="_blank" class="icn">
      <i class="fab fa-instagram"></i>
    </a>
    <a
      href="https://www.facebook.com/david.vasko.77"
      target="_blank"
      class="icn"
    >
      <i class="fab fa-facebook-square"></i>
    </a>
    <a href="mailto:vasko6d@gmail.com" class="icn">
      <i class="fas fa-envelope"></i>
    </a>
    <a href="/pdf/20200324-resume.pdf" target="_blank" class="icn">
      <i class="fas fa-file"></i>
    </a>
  </div>
</template>

<script>
export default {
  name: "FooterLinks",
};
</script>

<style lang="scss">
@import "@/assets/styles/wrapper.scss";
#footer-links {
  margin: 15px 0px;
  a {
    text-decoration: none;
    text-align: center;
    padding: 0px 10px;
  }
  .fas,
  .fab {
    font-size: 32px;
    @media only screen and (max-width: 850px) {
      font-size: 30px;
    }
    @media only screen and (max-width: 700px) {
      font-size: 28px;
    }
  }
}
</style>
