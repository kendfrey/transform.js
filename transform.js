var transform = (function ()
{
	var t = {};
	
	t.vector = function (x, y, z)
	{
		return { x:x, y:y, z:z };
	};
	
	t.matrix = function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
	{
		return { a:a, b:b, c:c, d:d, e:e, f:f, g:g, h:h, i:i, j:j, k:k, l:l, m:m, n:n, o:o, p:p };
	};
	
	t.none = function ()
	{
		return t.matrix(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	};
	
	t.scale = function (x, y, z)
	{
		return t.matrix(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
	};
	
	t.scaleUniform = function (s)
	{
		return t.matrix(s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1);
	};
	
	t.translate = function (x, y, z)
	{
		return t.matrix(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
	};
	
	t.rotateX = function (a)
	{
		a = a / 180 * Math.PI;
		return t.matrix(1, 0, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, 0, Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1);
	};
	
	t.rotateY = function (a)
	{
		a = a / 180 * Math.PI;
		return t.matrix(Math.cos(a), 0, Math.sin(a), 0, 0, 1, 0, 0, -Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1);
	};
	
	t.rotateZ = function (a)
	{
		a = a / 180 * Math.PI;
		return t.matrix(Math.cos(a), -Math.sin(a), 0, 0, Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	};
	
	t.multi = function ()
	{
		return Array.prototype.reduceRight.call(arguments, function (x, y) { return mmul(x, y); });
	};
	
	t.perspectiveCamera = function (p, l, u, fov, w, h)
	{
		var s = w / Math.tan(fov / 360 * Math.PI);
		return t.multi(
			t.translate(-p.x, -p.y, -p.z),
			look(t.vector(l.x-p.x, l.y-p.y, l.z-p.z), u),
			t.matrix(s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 1, 0, 0, -1, 0),
			t.translate(w*0.5, h*0.5, 0));
	};
	
	t.orthoCamera = function (p, l, u, wov, w, h)
	{
		var s = w * 0.5 / wov;
		return t.multi(
			t.translate(-p.x, -p.y, -p.z),
			look(t.vector(l.x-p.x, l.y-p.y, l.z-p.z), u),
			t.matrix(s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
			t.translate(w*0.5, h*0.5, 0));
	};
	
	t.project = function (v)
	{
		var m = t.multi.apply(t, Array.prototype.slice.call(arguments, 1));
		return fromHomo(vmul(toHomo(v), m));
	};
	
	function toHomo(v)
	{
		return { x:v.x, y:v.y, z:v.z, w:1 };
	}
	
	function fromHomo(v)
	{
		return { x:v.x/v.w, y:v.y/v.w };
	}
	
	function vmul(v, m)
	{
		return { x:v.x*m.a+v.y*m.b+v.z*m.c+v.w*m.d, y:v.x*m.e+v.y*m.f+v.z*m.g+v.w*m.h, z:v.x*m.i+v.y*m.j+v.z*m.k+v.w*m.l, w:v.x*m.m+v.y*m.n+v.z*m.o+v.w*m.p };
	}
	
	function mmul(x, y)
	{
		return t.matrix(x.a*y.a+x.b*y.e+x.c*y.i+x.d*y.m, x.a*y.b+x.b*y.f+x.c*y.j+x.d*y.n, x.a*y.c+x.b*y.g+x.c*y.k+x.d*y.o, x.a*y.d+x.b*y.h+x.c*y.l+x.d*y.p, x.e*y.a+x.f*y.e+x.g*y.i+x.h*y.m, x.e*y.b+x.f*y.f+x.g*y.j+x.h*y.n, x.e*y.c+x.f*y.g+x.g*y.k+x.h*y.o, x.e*y.d+x.f*y.h+x.g*y.l+x.h*y.p, x.i*y.a+x.j*y.e+x.k*y.i+x.l*y.m, x.i*y.b+x.j*y.f+x.k*y.j+x.l*y.n, x.i*y.c+x.j*y.g+x.k*y.k+x.l*y.o, x.i*y.d+x.j*y.h+x.k*y.l+x.l*y.p, x.m*y.a+x.n*y.e+x.o*y.i+x.p*y.m, x.m*y.b+x.n*y.f+x.o*y.j+x.p*y.n, x.m*y.c+x.n*y.g+x.o*y.k+x.p*y.o, x.m*y.d+x.n*y.h+x.o*y.l+x.p*y.p);
	}
	
	function look(f, u)
	{
		var z = normalize(f);
		var x = normalize(cross(u, z));
		var y = cross(z, x);
		return t.matrix(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1);
	}
	
	function normalize(v)
	{
		var l = Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
		return t.vector(v.x/l, v.y/l, v.z/l);
	}
	
	function cross(x, y)
	{
		return t.vector(x.y*y.z-x.z*y.y, x.z*y.x-x.x*y.z, x.x*y.y-x.y*y.x);
	}
	
	return t;
}());
