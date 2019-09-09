<template>
  <div id="footer-links">
    <a href="https://github.com/vasko6d" target="_blank">
      <i class="fab fa-github fa-2x"></i>
    </a>
    <a
      href="https://www.linkedin.com/in/david-vasko-968726106/"
      target="_blank"
    >
      <i class="fab fa-linkedin fa-2x"></i>
    </a>
    <!--a href="https://stackexchange.com/users/15465303/vasko6d" >
			<i class="fas fa-stack-overflow fa-2x"></i>
			</i>
    </a-->
    <a href="https://www.hackerrank.com/vasko6d" target="_blank">
      <i class="fab fa-hackerrank fa-2x"></i>
    </a>
    <a href="https://www.instagram.com/vasko6d/" target="_blank">
      <i class="fab fa-instagram fa-2x"></i>
    </a>
    <a href="https://www.facebook.com/david.vasko.77" target="_blank">
      <i class="fab fa-facebook-square fa-2x"></i>
    </a>
    <a href="mailto:vasko6d@gmail.com">
      <i class="fas fa-envelope fa-2x"></i>
    </a>
    <a href="/pdf/20190814-resume.pdf" target="_blank">
      <i class="fas fa-file fa-2x"></i>
    </a>
  </div>
</template>

<script>
export default {
  name: "FooterLinks"
};
</script>

<style lang="scss">
@import "@/assets/styles/variables.scss";
#footer-links {
  margin: 15px 0px;
  a {
    color: darken($nav-txt, 25%);
    text-decoration: none;
    text-align: center;
    padding: 0px 10px;
    :hover {
      color: $nav-txt;
    }
  }
}
</style>
