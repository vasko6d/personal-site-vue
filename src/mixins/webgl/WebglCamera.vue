<script>
// Mixin and Class Imports
import MatrixMath from "@/mixins/webgl/MatrixMath.vue";
var mv = MatrixMath.methods;

export default {
  name: "WebglCamera",
  methods: {
    initCamera(origCameraPos) {
      var camera = {
        theta: 0.0,
        phi: 0.0,
        dr: mv.radians(1),
        eye: mv.vec3(0, 0, 0),
        up: mv.vec3(0.0, 1.0, 0.0),
        fovy: 90,
        translation: mv.translationMatrix(origCameraPos),
        origCameraPosition: origCameraPos
      };
      return camera;
    },
    control(ch, camera) {
      // Increas or decreas azimuth with h and k (look left or right)
      if (ch === "k") {
        camera.phi += camera.dr;
        return;
      }
      if (ch === "h") {
        camera.phi -= camera.dr;
        return;
      }
      // Increase/decrease Altitude with u and j (loop up or down)
      if (ch === "u") {
        if (camera.theta < 1.55) {
          camera.theta += camera.dr;
        }
        return;
      }
      if (ch === "j") {
        if (camera.theta > -1.55) {
          camera.theta -= camera.dr;
        }
        return;
      }

      // Widen or narrow the verticle feild of view with g or b (zoom in or zoom out essentially)
      if (ch === "b") {
        camera.fovy += 1;
        return;
      }
      if (ch === "g") {
        camera.fovy -= 1;
        return;
      }

      // By rotating the original orthonormal basis twice we get a new ortonormal
      // basis that is based on our current camera position
      var orthoNormal = mv.rotationMatrix((camera.phi * 180) / Math.PI, [
        0,
        1,
        0
      ]);
      orthoNormal = mv.mult(
        mv.rotationMatrix((-1 * camera.theta * 180) / Math.PI, [0, 0, 1]),
        orthoNormal
      );

      // Using the orthonormal basis, move forward, backward, left, right, up and down
      // Left
      if (ch === "a") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[2][0],
              0.25 * orthoNormal[2][1],
              0.25 * orthoNormal[2][2]
            )
          )
        );
      }
      // Backward
      if (ch === "s") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[0][0],
              0.25 * orthoNormal[0][1],
              0.25 * orthoNormal[0][2]
            )
          )
        );
      }
      // Right
      if (ch === "d") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[2][0],
              -0.25 * orthoNormal[2][1],
              -0.25 * orthoNormal[2][2]
            )
          )
        );
      }
      // Forward
      if (ch === "w") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[0][0],
              -0.25 * orthoNormal[0][1],
              -0.25 * orthoNormal[0][2]
            )
          )
        );
      }
      // Upward
      if (ch === "r") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              -0.25 * orthoNormal[1][0],
              -0.25 * orthoNormal[1][1],
              -0.25 * orthoNormal[1][2]
            )
          )
        );
      }
      // Downward
      if (ch === "f") {
        camera.translation = mv.mult(
          camera.translation,
          mv.translationMatrix(
            mv.vec3(
              0.25 * orthoNormal[1][0],
              0.25 * orthoNormal[1][1],
              0.25 * orthoNormal[1][2]
            )
          )
        );
      }
      return;
    }
  }
};
</script>
