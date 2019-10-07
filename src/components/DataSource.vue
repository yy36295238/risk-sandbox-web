<template>
  <div class="pad50" @dblclick="showBar" style="height: 100%;">
    <Row type="flex" justify="center" align="middle">
      <Col>
      <div style="margin-top:20px;">
        <span>
          <Input v-model="dataSourceName" search enter-button size="large" placeholder="搜索数据源" style="width:400px" @on-change="dataSourceSearch" />
        </span>
      </div>
      </Col>
    </Row>
    <br>
    <br>
    <!-- tool bar -->
    <div>
      <Button type="primary" icon="md-add" @click="showAdd()">添加</Button>
      <Button v-show="barEnable" type="success" icon="ios-sunny" @click="allEnable(true)">启用</Button>
      <Button v-show="barDisable" type="dashed" icon="ios-sunny-outline" @click="allEnable(false)">停用</Button>
    </div>

    <Row :gutter="32">
      <Col span="6" v-for="(item,index) in dataSources" class="top30 cursor">
      <Card>
        <p slot="title" style="margin-top:2px">
          <Icon type="ios-leaf" size=18 color="#19be6b" style="margin-top:-5px" />
          {{item.dataSource}}
        </p>
        <a href="#" slot="extra">
          <Icon v-show="barDel" type="ios-close-circle" color="#ed4014" size=20 @click="remove(item.id)" style="position: relative;left: 58px;top: -27px;" />
          <i-switch size="small" :value=item.enable :id=item.id @on-change="enableHandle">
            <span slot="open"></span>
            <span slot="close"></span>
          </i-switch>
        </a>
        <span style="word-wrap:break-word;cursor:pointer;color:#515a6e" @click="showUpdate(item.id)">
          <Icon type="ios-medical" style="margin-top:-3px" /> {{item.taskId}}
        </span>
      </Card>
      </Col>
    </Row>

    <!-- 抽屉 -->
    <Drawer title="数据源" v-model="isShowDrawer" width="720" :mask-closable="false" :styles="styles" placement="left">
      <Form :model="formData">
        <Row :gutter="32">
          <Col span="12">
          <FormItem label="dataSource" label-position="top">
            <Input v-model="formData.dataSource" placeholder="dataSource" />
          </FormItem>
          </Col>
          <Col span="12">
          <FormItem label="taskId" label-position="top">
            <Input v-model="formData.taskId" placeholder="taskId" disabled />
          </FormItem>
          </Col>
        </Row>
        <FormItem label="data" label-position="top">
          <Input type="textarea" v-model="formData.data" :rows="25" :autosize="{minRows: 20,maxRows: 20}" placeholder="data" />
        </FormItem>
      </Form>
      <div class="drawer-footer">
        <Button style="margin-right: 8px" @click="isShowDrawer = false">取消</Button>
        <Button type="primary" @click="addHandler">确定</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: "http://localhost:8888",
      dataSourceName: "",
      dataSources: [],
      dataSourcesTmp: [],
      isShowDrawer: false,
      barDel: false,
      barEnable: false,
      barDisable: false,
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },
      formData: {
        taskId: this.guid(),
        dataSource: '',
        data: '',
        enable: true,
      },
      isUpdate: false
    };
  },
  mounted() {
    this.query();
  },
  methods: {
    showAdd() {
      this.isUpdate = false;
      this.isShowDrawer = true;
      this.formData.taskId = this.guid();
      this.reset();
    },
    addHandler() {
      var that = this;
      if (!this.formData.dataSource || !this.formData.data) {
        this.$Notice.warning({
          title: 'dataSource 或 taskId 不能为空'
        });
        return;
      }
      var uri = this.isUpdate ? "updateById" : "add";
      this.$axios.post(this.url + "/api/v1/riskMockData/" + uri, this.formData).then(function (res) {
        if (res.data.code != 200) {
          that.$Notice.warning({
            title: res.data.message
          });
          return;
        }
        that.$Notice.success({
          title: res.data.message
        });
        that.isShowDrawer = false;
        that.query();
      })
    },
    query() {
      var that = this;
      this.$axios.get(this.url + "/api/v1/riskMockData/list").then(function (res) {
        that.dataSources = res.data.data;
        that.dataSourcesTmp = res.data.data;
      })
    },
    remove(id) {
      var that = this;
      this.$axios.post(this.url + "/api/v1/riskMockData/deleteById", { "id": id }).then(function (res) {
        that.$Notice.success({
          title: res.data.message
        });
        that.query();
      })
    },
    enableHandle(enable) {
      var that = this;
      this.$axios.post(this.url + "/api/v1/riskMockData/updateById", { "id": event.currentTarget.id, "enable": enable })
        .then(function (res) {
          that.$Notice.success({
            title: res.data.message
          });
        })
    },
    allEnable(enable) {
      var that = this;
      this.$axios.post(this.url + "/api/v1/riskMockData/allEnable", { "enable": enable }).then(function (res) {
        that.$Notice.success({
          title: res.data.message
        });
        for (var val of that.dataSources) {
          val.enable = enable;
        }
      })
    },
    showUpdate(id) {
      var that = this;
      this.isUpdate = true;
      this.isShowDrawer = true;
      this.$axios.get(this.url + "/api/v1/riskMockData/one?id=" + id).then(function (res) {
        var data = res.data.data;
        that.formData.id = data.id;
        that.formData.taskId = data.taskId;
        that.formData.dataSource = data.dataSource;
        that.formData.data = data.data;
      })
    },
    dataSourceSearch() {
      if (!this.dataSourceName) {
        this.dataSources = this.dataSourcesTmp;
        return;
      }
      this.dataSources = this.fuzzyQuery(this.dataSourcesTmp, this.dataSourceName)

    },
    reset() {
      this.formData.dataSource = '';
      this.formData.data = '';
    },
    showBar() {
      this.barDel = !this.barDel;
      this.barEnable = !this.barEnable;
      this.barDisable = !this.barDisable;
    },
    fuzzyQuery(list, keyWord) {
      var arr = [];
      for (var i = 0; list && i < list.length; i++) {
        if (list[i].dataSource.toLowerCase().indexOf(keyWord.toLowerCase()) > -1) {
          arr.push(list[i]);
        }
      }
      return arr;
    },
    guid() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return "SD" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pad30 {
  padding: 30px;
}
.pad50 {
  padding: 50px;
}
.top30 {
  margin-top: 30px;
}
.drawer-footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
}
</style>
