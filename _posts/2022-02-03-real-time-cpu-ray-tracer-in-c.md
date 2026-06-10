---
layout: default
title: Real-time CPU Ray Tracer in C++
date: 2022-02-03
description: "Built a real-time CPU raytracer in C++ for Advanced Graphics course, implementing BVH acceleration structures and SIMD optimization for ray-AABB intersection tests."
tags: ["C++", "Graphics", "Ray Tracing", "SIMD", "Performance"]
---

**Language**: C++

**Team Size**: 2

**Role**: Programmer

**Duration**: 3 weeks

**Code**: [here](https://github.com/maniatic0/Advanced-Graphics-Project/tree/main/lib/RenderCore_Project).

For the [Advanced Graphics](https://www.cs.uu.nl/docs/vakken/magr/2020-2021/index.html) course, we built a real-time CPU raytracer in C++. During our second assignment, we saw that working with BVHs. Our implementation was one of the few that achieved the “Construct the BVH for a 2M triangle scene in less than 1 second” task. Due to the fun we had, we selected to work on acceleration structures for our last project. We implemented two BVH papers selected by the professor, [Large Ray Packets for Real-time Whitted Ray Tracing](https://cseweb.ucsd.edu/~ravir/whitted.pdf) and [Efficient Ray Tracing Kernels for Modern CPU Architectures](https://jcgt.org/published/0004/04/05/).

During this project, I worked on the SIMD implementation of the intersection utilities we used for the papers. It was the first time I’ve ever worked with them and they were fun to experiment with them. Thanks to our SSE intersection utilities and my partner’s implementation of the 2-way BVH based on [Large Ray Packets for Real-time Whitted Ray Tracing](https://cseweb.ucsd.edu/~ravir/whitted.pdf), we obtained made our Whitted raytracer real-time for even bigger scenes that we had previously supported.

I also worked on the [Efficient Ray Tracing Kernels for Modern CPU Architectures](https://jcgt.org/published/0004/04/05/) implementation for a 4-way BVH. It was quite challenging to implement as the paper had some small ambiguous parts that affected the correct traversal. But, after a lot of debugging, I managed to implement it. To further improve the implementation, as the paper’s main idea was to use AVX instructions, I reimplemented our intersection utilities using them. They improved quite a lot the performance of the 4-way BVH, but sadly it only lasted for the first few seconds as they triggered thermal throttles in my laptop (my partner’s laptop didn’t have AVX support).

In the end, it was a fun project implementing interesting acceleration structures and playing with SIMD instructions for the first time.

### Example Code

Available [here](https://github.com/maniatic0/Advanced-Graphics-Project/blob/d600e4f2f50884efc54ec2e80c6eac8ded21537d/lib/RenderCore_Project/intersection_utils.h#L382).

```cpp
inline uchar TestAABB4IntersectionDistance(const Ray& r, const aabb boxes[4], const float3 invDir, float distances[4])
{
#define USE_AVX_TEST_4_AABB_DISTANCE
#ifdef USE_AVX_TEST_4_AABB_DISTANCE
	// Modified From https://medium.com/@bromanz/another-view-on-the-classic-ray-aabb-intersection-algorithm-for-bvh-traversal-41125138b525

	uchar res = 0;

	const __m256  ori = _mm256_setr_ps(r.origin.x, r.origin.y, r.origin.z, 0, r.origin.x, r.origin.y, r.origin.z, 0);
	const __m256  dirInv = _mm256_setr_ps(invDir.x, invDir.y, invDir.z, 0, invDir.x, invDir.y, invDir.z, 0);

	for (int i = 0; i < 2; i++)
	{
		const int baseIndex0 = 2 * i + 0;
		const int baseIndex1 = baseIndex0 + 1;
		
		const __m256 t0 = _mm256_mul_ps(_mm256_sub_ps(_mm256_setr_m128(boxes[baseIndex0].bmin4, boxes[baseIndex1].bmin4), ori), dirInv);
		const __m256 t1 = _mm256_mul_ps(_mm256_sub_ps(_mm256_setr_m128(boxes[baseIndex0].bmax4, boxes[baseIndex1].bmax4), ori), dirInv);

		__m256 tmin = _mm256_min_ps(t0, t1);
		__m256 tmax = _mm256_max_ps(t0, t1);

		// Horizontal max. Note that the last component is trash
		tmin = _mm256_max_ps(tmin, _mm256_shuffle_ps(tmin, tmin, _MM_SHUFFLE(2, 1, 0, 2)));
		tmin = _mm256_max_ps(tmin, _mm256_shuffle_ps(tmin, tmin, _MM_SHUFFLE(1, 0, 2, 2)));

		// Horizontal min. Note that the last component is trash
		tmax = _mm256_min_ps(tmax, _mm256_shuffle_ps(tmax, tmax, _MM_SHUFFLE(2, 1, 0, 2)));
		tmax = _mm256_min_ps(tmax, _mm256_shuffle_ps(tmax, tmax, _MM_SHUFFLE(1, 0, 2, 2)));

		const __m256 comp = _mm256_cmp_ps(tmin, tmax, _CMP_LE_OQ);
		const int mask = _mm256_movemask_ps(comp);

		const bool r0 = (mask & 0x7) == 0x7;
		const bool r1 = (mask & 0x70) == 0x70;

		// assert(r0 == TestAABBIntersection(r, boxes[2 * i + 0], invDir));
		// assert(r1 == TestAABBIntersection(r, boxes[2 * i + 1], invDir));

		res |= (r0 << (2 * i + 0)) | (r1 << (2 * i + 1));

		// Note that they might contain trash, check mask
		distances[baseIndex0] = max(_mm_cvtss_f32(_mm256_extractf128_ps(tmin, 0)), 0.0f); // Max, if negative you are inside
		distances[baseIndex1] = max(_mm_cvtss_f32(_mm256_extractf128_ps(tmin, 1)), 0.0f);
		assert((r0 && distances[baseIndex0] >= 0) || !r0);
		assert((r1 && distances[baseIndex1] >= 0) || !r1);
	}

	return res;

#else
	uchar res = 0;

	for (int i = 0; i < 4; i++)
	{
		distances[i] = TestAABBIntersectionDistance(r, boxes[i], invDir);
		res |= ((distances[i] >= 0) << i);
	}

	return res;
#endif
}
```
