---
layout: default
title: Fast Memory Copy using AVX
date: 2022-01-31
---

# Fast Memory Copy using AVX

**Language**: C++

**Team Size**: 2

**Role**: Programmer

**Duration**: 3 weeks

**Code**: [here](https://github.com/jbikker/WrldTmpl8/blob/3f001bef28e66eb9da7d33543f31b8e1859843a9/template/world.h#L266)

Done for the last project in the [Optimization course](https://www.cs.uu.nl/docs/vakken/mov/) at Utrecht University, which consisted of optimizing [Prof. Jacco’s voxel engine](https://github.com/jbikker/WrldTmpl8) for general game development. For this purpose, we use VTune to profile the code and get hotspots.

At the end of the project, I profiled the asynchronous memory copy of all the modified voxels as the main bottleneck left to tackle. This system, developed by Prof. Jacco, copied the memory that contained the modified voxels (by copying 8x8x8 blocks that contained them) to the GPU for rendering. This process happened asynchronously with the use of tasks (one per logical core, running in SMT) and AVX memory streaming operations.

My thought process for the improvement was that given, that two threads are running in the same physical core using SMT and that commonly there are [16 public AVX registers per core](https://stackoverflow.com/questions/62419256/how-can-i-determine-how-many-avx-registers-my-processor-has) (I understand there can be more physicals registers for renaming), each thread could use 8 AVX registers in an unrolled loop to speed up the copying. As well, the loop unrolling would improve performance as fewer jumps would be needed, and it would help the compiler understand that the copies could be done in parallel as all the calls would be to adjacent memory easily calculable from the pointers.

To test my hypothesis, I compared the original code, the 8 register idea, 4 registers, and 16 registers. In the end, the 8 registers idea was the fastest of all. As well, Prof. Jacco selected this optimization to be included in [his engine](https://github.com/jbikker/WrldTmpl8/blob/3f001bef28e66eb9da7d33543f31b8e1859843a9/template/world.h#L266).

### Original Code

```cpp
uint N = bytes / 32;
for (; N > 0; N--, src++, dst++)
{
	const __m256i d = _mm256_stream_load_si256( src );
	_mm256_stream_si256( dst, d );
}
```

### Optimized Code

```cpp
uint N = bytes / 32;
constexpr uint registers = 8;
uint unalignedStep = N % registers;
for (; N > 0 && unalignedStep > 0; N--, unalignedStep--, src++, dst++)
{
	const __m256i d = _mm256_stream_load_si256( src );
	_mm256_stream_si256( dst, d );
}
static_assert(registers == 8);
for (; N > 0; N -= registers)
{
	// Based on https://stackoverflow.com/questions/62419256/how-can-i-determine-how-many-avx-registers-my-processor-has
	const __m256i d0 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d0 );
	const __m256i d1 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d1 );
	const __m256i d2 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d2 );
	const __m256i d3 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d3 );
	const __m256i d4 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d4 );
	const __m256i d5 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d5 );
	const __m256i d6 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d6 );
	const __m256i d7 = _mm256_stream_load_si256( src++ );
	_mm256_stream_si256( dst++, d7 );
}
```
