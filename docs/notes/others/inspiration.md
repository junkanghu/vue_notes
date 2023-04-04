# Not specific solutions but new ideas for some fields.

## inverse rendering
1. 从PBR来看inverse rendering，它是一个ambiguous的问题，要想做好这个task，就是要克服ambiguity，做好decomposition。完全对intermediate结果不做supervision是不可能的，因此各种方法就是在对它们做supervise。
2. 在做natural video的portrit relighting时，要结合实际场景的light conditions去生成training samples和去设计算法。（参考NVPR）
3. PBR结果不好，要从其中的各个components出发思考，到底是哪个component优化地不好，再想办法去单独解决这个component。
4. domain gap可能存在于某个component，要想办法从某个component解决domain gap。
5. 在decomposition时，给某些components加监督，不一定要求gt非常好，因为decomposition是一个ambiguous的问题，不完美的gt加到上面，可以保证网络预测至少make sense，在正确的值附近根据training samples自由波动。（从Nerfactor和unsupervised De-render可以看出）
6. inverse rendering做得好不好，主要是看decomposition成不成功，有没有克服ambiguity，使得各个component被成功地decompose开来，只有成功decompose了，再次进行relighting才能准确。因此在优化时，要时刻关注每个component的值（或者可视化来看）或者说loss，来看其是否被成功地decompose开来，若不成功，再想办法加regularization，使其更准确。