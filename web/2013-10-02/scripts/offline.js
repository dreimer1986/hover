/* Local restoration only; original scripts are under archive/web. */
window.ga = function () {};
window.ieFlyout = { init: function () {} };
(function () {
  var replacements = {
  "Modern/CLOAK_ST.aaf875b1.ogg": "reconstructed/Modern/CLOAK_ST.ogg",
  "Modern/GAMEOVR.8567da1d.ogg": "reconstructed/Modern/GAMEOVR.ogg",
  "Modern/HIT_POD.cb5ba5e7.ogg": "reconstructed/Modern/HIT_POD.ogg",
  "Modern/JUMP_ST.ef74e5fd.ogg": "reconstructed/Modern/JUMP_ST.ogg",
  "Modern/OBT_CLOA.cc1091d7.ogg": "reconstructed/Modern/OBT_CLOA.ogg",
  "Modern/OBT_JUMP.cc1091d7.ogg": "reconstructed/Modern/OBT_JUMP.ogg",
  "Modern/OBT_RFLG.ea3cb0b8.ogg": "reconstructed/Modern/OBT_RFLG.ogg",
  "Modern/SPEED_EN.d283de67.ogg": "reconstructed/Modern/SPEED_EN.ogg",
  "Modern/SPEED_RE.f1c39155.ogg": "reconstructed/Modern/SPEED_RE.ogg",
  "Retro/ATTKPING.505be4ec.m4a": "Retro/ATTKPING.m4a",
  "Retro/CLOAK_EN.cad25d66.m4a": "Retro/CLOAK_EN.m4a",
  "Retro/CLOAK_ST.97bdbb16.m4a": "Retro/CLOAK_ST.m4a",
  "Retro/ENG_HIGH.08d00657.m4a": "Retro/ENG_HIGH.m4a",
  "Retro/ENG_IDLE.612bff36.m4a": "Retro/ENG_IDLE.m4a",
  "Retro/ENG_LOW.b6b0d4b3.m4a": "Retro/ENG_LOW.m4a",
  "Retro/ENG_NORM.f46edc7c.m4a": "Retro/ENG_NORM.m4a",
  "Retro/FLAGR_DR.51295c42.m4a": "Retro/FLAGR_DR.m4a",
  "Retro/FLAGR_ST.31e441e5.m4a": "Retro/FLAGR_ST.m4a",
  "Retro/GAMEOVR.c1598df1.m4a": "Retro/GAMEOVR.m4a",
  "Retro/HIT_MAPE.96dc6d6e.m4a": "Retro/HIT_MAPE.m4a",
  "Retro/HIT_POD.19f25923.m4a": "Retro/HIT_POD.m4a",
  "Retro/HIT_ROBT.5fb7d87a.m4a": "Retro/HIT_ROBT.m4a",
  "Retro/HIT_SHLD.d3d74732.m4a": "Retro/HIT_SHLD.m4a",
  "Retro/HIT_WALL.04e8116f.m4a": "Retro/HIT_WALL.m4a",
  "Retro/HOLD_EN.d3398967.m4a": "Retro/HOLD_EN.m4a",
  "Retro/HOLD_ST.93ce694d.m4a": "Retro/HOLD_ST.m4a",
  "Retro/INVIN_EN.17bf3b34.m4a": "Retro/INVIN_EN.m4a",
  "Retro/INVIN_ST.0f358e86.m4a": "Retro/INVIN_ST.m4a",
  "Retro/JUMP_EN.3f8b18d3.m4a": "Retro/JUMP_EN.m4a",
  "Retro/JUMP_ST.0b24aaa7.m4a": "Retro/JUMP_ST.m4a",
  "Retro/LEVLSTRT.a35620c8.m4a": "Retro/LEVLSTRT.m4a",
  "Retro/OBT_CLOA.85a3bbfc.m4a": "Retro/OBT_CLOA.m4a",
  "Retro/OBT_HFLG.43da27b1.m4a": "Retro/OBT_HFLG.m4a",
  "Retro/OBT_JUMP.f1f79eb0.m4a": "Retro/OBT_JUMP.m4a",
  "Retro/OBT_RFLG.a495fa41.m4a": "Retro/OBT_RFLG.m4a",
  "Retro/OBT_WALL.4ad367bb.m4a": "Retro/OBT_WALL.m4a",
  "Retro/SHIELD.d1b7d6de.m4a": "Retro/SHIELD.m4a",
  "Retro/SKID_ST.f6cc31bc.m4a": "Retro/SKID_ST.m4a",
  "Retro/SPEED_EN.8e05bf62.m4a": "Retro/SPEED_EN.m4a",
  "Retro/SPEED_RE.9e916998.m4a": "Retro/SPEED_RE.m4a",
  "Retro/WINLEVEL.69339935.m4a": "Retro/WINLEVEL.m4a",
  "Retro/ATTKPING.1f7e0ea5.ogg": "reconstructed/Retro/ATTKPING.ogg",
  "Retro/CLOAK_EN.3ce2fa05.ogg": "reconstructed/Retro/CLOAK_EN.ogg",
  "Retro/CLOAK_ST.65826eeb.ogg": "reconstructed/Retro/CLOAK_ST.ogg",
  "Retro/ENG_HIGH.0402b5a4.ogg": "reconstructed/Retro/ENG_HIGH.ogg",
  "Retro/ENG_IDLE.6b472f63.ogg": "reconstructed/Retro/ENG_IDLE.ogg",
  "Retro/ENG_LOW.4a2af30b.ogg": "reconstructed/Retro/ENG_LOW.ogg",
  "Retro/ENG_NORM.e10d1d6d.ogg": "reconstructed/Retro/ENG_NORM.ogg",
  "Retro/FLAGR_DR.75fb9740.ogg": "reconstructed/Retro/FLAGR_DR.ogg",
  "Retro/FLAGR_ST.56deba42.ogg": "reconstructed/Retro/FLAGR_ST.ogg",
  "Retro/GAMEOVR.282d8389.ogg": "reconstructed/Retro/GAMEOVR.ogg",
  "Retro/HIT_MAPE.6adbb81e.ogg": "reconstructed/Retro/HIT_MAPE.ogg",
  "Retro/HIT_POD.eef6b869.ogg": "reconstructed/Retro/HIT_POD.ogg",
  "Retro/HIT_ROBT.9b007a02.ogg": "reconstructed/Retro/HIT_ROBT.ogg",
  "Retro/HIT_SHLD.ed6317db.ogg": "reconstructed/Retro/HIT_SHLD.ogg",
  "Retro/HIT_WALL.c8485790.ogg": "reconstructed/Retro/HIT_WALL.ogg",
  "Retro/HOLD_EN.422f62c3.ogg": "reconstructed/Retro/HOLD_EN.ogg",
  "Retro/HOLD_ST.1b9a5ab9.ogg": "reconstructed/Retro/HOLD_ST.ogg",
  "Retro/INVIN_EN.1ce37170.ogg": "reconstructed/Retro/INVIN_EN.ogg",
  "Retro/INVIN_ST.fd6db712.ogg": "reconstructed/Retro/INVIN_ST.ogg",
  "Retro/JUMP_EN.73d1fff1.ogg": "reconstructed/Retro/JUMP_EN.ogg",
  "Retro/JUMP_ST.15b7b763.ogg": "reconstructed/Retro/JUMP_ST.ogg",
  "Retro/LEVLSTRT.22649c87.ogg": "reconstructed/Retro/LEVLSTRT.ogg",
  "Retro/OBT_CLOA.fa8a0d59.ogg": "reconstructed/Retro/OBT_CLOA.ogg",
  "Retro/OBT_HFLG.aea9e1f7.ogg": "reconstructed/Retro/OBT_HFLG.ogg",
  "Retro/OBT_JUMP.96b54b63.ogg": "reconstructed/Retro/OBT_JUMP.ogg",
  "Retro/OBT_RFLG.73435e1f.ogg": "reconstructed/Retro/OBT_RFLG.ogg",
  "Retro/OBT_WALL.be263563.ogg": "reconstructed/Retro/OBT_WALL.ogg",
  "Retro/SHIELD.6bcd9dcf.ogg": "reconstructed/Retro/SHIELD.ogg",
  "Retro/SKID_ST.d5259bb3.ogg": "reconstructed/Retro/SKID_ST.ogg",
  "Retro/SPEED_EN.44e9478f.ogg": "reconstructed/Retro/SPEED_EN.ogg",
  "Retro/SPEED_RE.8556b54b.ogg": "reconstructed/Retro/SPEED_RE.ogg",
  "Retro/WINLEVEL.db367462.ogg": "reconstructed/Retro/WINLEVEL.ogg"
};
  [Hover.modernSoundFiles, Hover.retroSoundFiles].forEach(function (group) {
    Object.keys(group).forEach(function (format) {
      Object.keys(group[format]).forEach(function (name) {
        var original = group[format][name];
        if (replacements[original]) group[format][name] = replacements[original];
      });
    });
  });
})();

// These five unused scheme entries have no files in either preserved Store package.
// They are not used by maze 46; filtering avoids loading nonexistent textures.
Hover.json.schemes.Maze2.Textures = Hover.json.schemes.Maze2.Textures.filter(function (texture) {
  return !/^(FBASE_02|WBASE_09|WBASE_10|WBASE_11|WBASE_12)$/.test(texture.Name);
});
