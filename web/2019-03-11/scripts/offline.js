/* Local restoration only; original scripts are under archive/web. */
window.ga = function () {};
window.ieFlyout = { init: function () {} };
(function () {
  var replacements = {
  "Modern/ATTKPING.16951572.m4a": "Modern/ATTKPING.m4a",
  "Modern/CLOAK_EN.aa09d76d.m4a": "Modern/CLOAK_EN.m4a",
  "Modern/CLOAK_ST.ce0e1e0e.m4a": "Modern/CLOAK_ST.m4a",
  "Modern/FLAGR_DR.abde8df8.m4a": "Modern/FLAGR_DR.m4a",
  "Modern/FLAGR_ST.db10e388.m4a": "Modern/FLAGR_ST.m4a",
  "Modern/GAMEOVR.4330cf83.m4a": "Modern/GAMEOVR.m4a",
  "Modern/HIT_MAPE.95571504.m4a": "Modern/HIT_MAPE.m4a",
  "Modern/HIT_POD.6cda25f5.m4a": "Modern/HIT_POD.m4a",
  "Modern/HIT_ROBT.4c5244ec.m4a": "Modern/HIT_ROBT.m4a",
  "Modern/HIT_SHLD.6c7553c3.m4a": "Modern/HIT_SHLD.m4a",
  "Modern/HIT_WALL.58a27679.m4a": "Modern/HIT_WALL.m4a",
  "Modern/HOLD_EN.5ab0092e.m4a": "Modern/HOLD_EN.m4a",
  "Modern/HOLD_ST.4050c745.m4a": "Modern/HOLD_ST.m4a",
  "Modern/INVIN_EN.2fade336.m4a": "Modern/INVIN_EN.m4a",
  "Modern/INVIN_ST.ab50bf9a.m4a": "Modern/INVIN_ST.m4a",
  "Modern/JUMP_EN.044f7e1b.m4a": "Modern/JUMP_EN.m4a",
  "Modern/JUMP_ST.be925c71.m4a": "Modern/JUMP_ST.m4a",
  "Modern/LEVLSTRT.395af253.m4a": "Modern/LEVLSTRT.m4a",
  "Modern/MUSIC.2a8d5917.m4a": "Modern/MUSIC.m4a",
  "Modern/OBT_CLOA.8698f318.m4a": "Modern/OBT_CLOA.m4a",
  "Modern/OBT_HFLG.5331f099.m4a": "Modern/OBT_HFLG.m4a",
  "Modern/OBT_JUMP.8698f318.m4a": "Modern/OBT_JUMP.m4a",
  "Modern/OBT_RFLG.da3f12a8.m4a": "Modern/OBT_RFLG.m4a",
  "Modern/OBT_WALL.ca66e316.m4a": "Modern/OBT_WALL.m4a",
  "Modern/SHIELD.b3739ebd.m4a": "Modern/SHIELD.m4a",
  "Modern/SKID_ST.486068aa.m4a": "Modern/SKID_ST.m4a",
  "Modern/SPEED_EN.fb90f239.m4a": "Modern/SPEED_EN.m4a",
  "Modern/SPEED_RE.c6dbd0ce.m4a": "Modern/SPEED_RE.m4a",
  "Modern/WINLEVEL.b5460545.m4a": "Modern/WINLEVEL.m4a",
  "Modern/ATTKPING.e90f8dca.ogg": "reconstructed/Modern/ATTKPING.ogg",
  "Modern/CLOAK_EN.e473c564.ogg": "reconstructed/Modern/CLOAK_EN.ogg",
  "Modern/CLOAK_ST.baedb94e.ogg": "reconstructed/Modern/CLOAK_ST.ogg",
  "Modern/FLAGR_DR.e96ef564.ogg": "reconstructed/Modern/FLAGR_DR.ogg",
  "Modern/FLAGR_ST.555c35fb.ogg": "reconstructed/Modern/FLAGR_ST.ogg",
  "Modern/GAMEOVR.83d4efc5.ogg": "reconstructed/Modern/GAMEOVR.ogg",
  "Modern/HIT_MAPE.ba44d698.ogg": "reconstructed/Modern/HIT_MAPE.ogg",
  "Modern/HIT_POD.f6c43d47.ogg": "reconstructed/Modern/HIT_POD.ogg",
  "Modern/HIT_ROBT.ae2a52e4.ogg": "reconstructed/Modern/HIT_ROBT.ogg",
  "Modern/HIT_SHLD.d37d9428.ogg": "reconstructed/Modern/HIT_SHLD.ogg",
  "Modern/HIT_WALL.737cfb7f.ogg": "reconstructed/Modern/HIT_WALL.ogg",
  "Modern/HOLD_EN.d9fa87d8.ogg": "reconstructed/Modern/HOLD_EN.ogg",
  "Modern/HOLD_ST.069869b5.ogg": "reconstructed/Modern/HOLD_ST.ogg",
  "Modern/INVIN_EN.ae0417c9.ogg": "reconstructed/Modern/INVIN_EN.ogg",
  "Modern/INVIN_ST.5ed06eea.ogg": "reconstructed/Modern/INVIN_ST.ogg",
  "Modern/JUMP_EN.3efb9b8a.ogg": "reconstructed/Modern/JUMP_EN.ogg",
  "Modern/JUMP_ST.890e191b.ogg": "reconstructed/Modern/JUMP_ST.ogg",
  "Modern/LEVLSTRT.3bf731f6.ogg": "reconstructed/Modern/LEVLSTRT.ogg",
  "Modern/MUSIC.aa246c69.ogg": "reconstructed/Modern/MUSIC.ogg",
  "Modern/OBT_CLOA.509a0928.ogg": "reconstructed/Modern/OBT_CLOA.ogg",
  "Modern/OBT_HFLG.7ac000cd.ogg": "reconstructed/Modern/OBT_HFLG.ogg",
  "Modern/OBT_JUMP.509a0928.ogg": "reconstructed/Modern/OBT_JUMP.ogg",
  "Modern/OBT_RFLG.329beb7d.ogg": "reconstructed/Modern/OBT_RFLG.ogg",
  "Modern/OBT_WALL.509a0928.ogg": "reconstructed/Modern/OBT_WALL.ogg",
  "Modern/SHIELD.15795ef3.ogg": "reconstructed/Modern/SHIELD.ogg",
  "Modern/SKID_ST.7b1f8945.ogg": "reconstructed/Modern/SKID_ST.ogg",
  "Modern/SPEED_EN.52da27e0.ogg": "reconstructed/Modern/SPEED_EN.ogg",
  "Modern/SPEED_RE.9dbd526a.ogg": "reconstructed/Modern/SPEED_RE.ogg",
  "Modern/WINLEVEL.7cd9f6ee.ogg": "reconstructed/Modern/WINLEVEL.ogg",
  "Retro/ATTKPING.d23ce83d.ogg": "reconstructed/Retro/ATTKPING.ogg",
  "Retro/CLOAK_EN.0f92e393.ogg": "reconstructed/Retro/CLOAK_EN.ogg",
  "Retro/CLOAK_ST.65826eeb.ogg": "reconstructed/Retro/CLOAK_ST.ogg",
  "Retro/ENG_HIGH.0402b5a4.ogg": "reconstructed/Retro/ENG_HIGH.ogg",
  "Retro/ENG_IDLE.e27efb7d.ogg": "reconstructed/Retro/ENG_IDLE.ogg",
  "Retro/ENG_LOW.636e8870.ogg": "reconstructed/Retro/ENG_LOW.ogg",
  "Retro/ENG_NORM.c098330f.ogg": "reconstructed/Retro/ENG_NORM.ogg",
  "Retro/FLAGR_DR.f3dbd903.ogg": "reconstructed/Retro/FLAGR_DR.ogg",
  "Retro/FLAGR_ST.73ff0d9f.ogg": "reconstructed/Retro/FLAGR_ST.ogg",
  "Retro/GAMEOVR.282d8389.ogg": "reconstructed/Retro/GAMEOVR.ogg",
  "Retro/HIT_MAPE.af079844.ogg": "reconstructed/Retro/HIT_MAPE.ogg",
  "Retro/HIT_POD.eef6b869.ogg": "reconstructed/Retro/HIT_POD.ogg",
  "Retro/HIT_ROBT.d9ec221a.ogg": "reconstructed/Retro/HIT_ROBT.ogg",
  "Retro/HIT_SHLD.ed6317db.ogg": "reconstructed/Retro/HIT_SHLD.ogg",
  "Retro/HIT_WALL.c8485790.ogg": "reconstructed/Retro/HIT_WALL.ogg",
  "Retro/HOLD_EN.ccdfd8f3.ogg": "reconstructed/Retro/HOLD_EN.ogg",
  "Retro/HOLD_ST.8fab829d.ogg": "reconstructed/Retro/HOLD_ST.ogg",
  "Retro/INVIN_EN.426e3b69.ogg": "reconstructed/Retro/INVIN_EN.ogg",
  "Retro/INVIN_ST.839ffad0.ogg": "reconstructed/Retro/INVIN_ST.ogg",
  "Retro/JUMP_EN.8565f4dc.ogg": "reconstructed/Retro/JUMP_EN.ogg",
  "Retro/JUMP_ST.392142cb.ogg": "reconstructed/Retro/JUMP_ST.ogg",
  "Retro/LEVLSTRT.3e7e066e.ogg": "reconstructed/Retro/LEVLSTRT.ogg",
  "Retro/OBT_CLOA.03383e45.ogg": "reconstructed/Retro/OBT_CLOA.ogg",
  "Retro/OBT_HFLG.aea9e1f7.ogg": "reconstructed/Retro/OBT_HFLG.ogg",
  "Retro/OBT_JUMP.b5fa2f40.ogg": "reconstructed/Retro/OBT_JUMP.ogg",
  "Retro/OBT_RFLG.73435e1f.ogg": "reconstructed/Retro/OBT_RFLG.ogg",
  "Retro/OBT_WALL.f19680e5.ogg": "reconstructed/Retro/OBT_WALL.ogg",
  "Retro/SHIELD.6ac1ca57.ogg": "reconstructed/Retro/SHIELD.ogg",
  "Retro/SKID_ST.589fb6c1.ogg": "reconstructed/Retro/SKID_ST.ogg",
  "Retro/SPEED_EN.c7eea585.ogg": "reconstructed/Retro/SPEED_EN.ogg",
  "Retro/SPEED_RE.e584da88.ogg": "reconstructed/Retro/SPEED_RE.ogg",
  "Retro/WINLEVEL.7a259ec8.ogg": "reconstructed/Retro/WINLEVEL.ogg"
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
