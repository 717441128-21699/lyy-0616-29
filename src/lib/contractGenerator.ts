import type { OnboardingProcess, EmployeePersonalInfo } from '@/types';
import { formatDate } from './dateUtils';

export const generateContractContent = (
  process_: OnboardingProcess,
  personalInfo?: EmployeePersonalInfo,
): string => {
  const employeeName = personalInfo?.fullName || process_.employeeName;
  const idNumber = personalInfo?.idNumber || '________________';
  const address = personalInfo?.address || '________________';
  const phone = personalInfo?.phone || '________________';
  const bankName = personalInfo?.bankName || '________________';
  const bankAccount = personalInfo?.bankAccount || '________________';

  const startDate = formatDate(process_.startDate);
  const endDate = formatDate(
    new Date(new Date(process_.startDate).getTime() + 365 * 24 * 60 * 60 * 1000 * 3),
  );
  const probationEnd = formatDate(process_.probationEndDate);
  const salary = process_.salary;
  const today = formatDate(new Date());

  return `
劳动合同

合同编号：HR-${process_.id.toUpperCase()}-${today.replace(/-/g, '')}

甲方（用人单位）：
公司名称：星辰科技有限公司
统一社会信用代码：91310000MA1FL00000
注册地址：上海市浦东新区张江高科技园区博云路2号浦软大厦
法定代表人：李星辰

乙方（劳动者）：
姓名：${employeeName}
身份证号码：${idNumber}
户籍地址：${address}
联系电话：${phone}

根据《中华人民共和国劳动法》、《中华人民共和国劳动合同法》及相关法律法规，甲乙双方本着平等自愿、协商一致的原则，签订本劳动合同，共同遵守本合同所列条款。

第一条  合同类型与期限

本合同为${process_.contractType}：
1.1 合同有效期自 ${startDate} 起至 ${endDate} 止。
1.2 试用期自 ${startDate} 起至 ${probationEnd} 止，共计90天。
1.3 试用期内，如乙方被证明不符合录用条件的，甲方有权依法解除本合同。

第二条  工作内容与工作地点

2.1 乙方同意在甲方 ${process_.department} 部门，担任 ${process_.position} 岗位工作。
2.2 乙方的主要工作职责包括但不限于：
    （1）根据岗位职责完成相应的工作任务；
    （2）遵守甲方规章制度，服从工作安排；
    （3）保守甲方商业秘密，维护甲方合法权益；
    （4）参与团队协作，完成上级交办的其他工作。
2.3 工作地点：上海市浦东新区张江高科技园区博云路2号浦软大厦。

第三条  工作时间与休息休假

3.1 甲方实行标准工时制，每日工作时间不超过8小时，每周工作时间不超过40小时。
3.2 甲方因工作需要安排乙方延长工作时间的，将按国家规定支付加班工资或安排调休。
3.3 乙方享有国家规定的法定节假日、年休假、婚假、产假等带薪假期。

第四条  劳动报酬

4.1 乙方转正后月工资标准为税前人民币 ${salary.toLocaleString()} 元整（￥${salary.toLocaleString()}.00）。
4.2 试用期工资按转正工资的80%发放，即税前人民币 ${Math.round(salary * 0.8).toLocaleString()} 元整。
4.3 甲方于每月10日以银行转账方式支付上月工资。
4.4 工资发放账户信息：
    开户银行：${bankName}
    银行账号：${bankAccount}
4.5 甲方根据公司经营状况、乙方工作表现，可对乙方薪酬进行调整，调整方案将以书面形式通知乙方。

第五条  社会保险与福利待遇

5.1 甲乙方按国家和上海市有关规定，按时足额缴纳基本养老保险、基本医疗保险、失业保险、工伤保险和生育保险。
5.2 乙方因工负伤或患职业病的待遇按国家和上海市有关规定执行。
5.3 乙方患病或非因工负伤的医疗待遇按国家和上海市有关规定执行。
5.4 甲方为乙方提供补充商业保险、年度体检、培训补贴等福利，具体按公司福利制度执行。

第六条  劳动保护与劳动条件

6.1 甲方为乙方提供符合国家规定的劳动安全卫生条件和必要的劳动防护用品。
6.2 甲方对乙方进行职业道德、业务技术、劳动安全卫生等方面的教育和培训。
6.3 乙方在劳动过程中必须严格遵守安全操作规程，有权拒绝甲方的违章指挥。

第七条  劳动纪律与规章制度

7.1 乙方应自觉遵守国家法律法规及甲方制定的各项规章制度。
7.2 乙方违反规章制度的，甲方可依据规定给予相应处分，直至解除本合同。
7.3 乙方应严格遵守保密义务，未经甲方书面同意，不得向任何第三方披露甲方商业秘密。

第八条  合同的变更、解除、终止与续订

8.1 本合同的变更须经甲乙双方协商一致，并采用书面形式。
8.2 本合同的解除、终止按《劳动合同法》及相关法律法规执行。
8.3 合同期满前30日，甲方将书面通知乙方是否续订劳动合同。

第九条  经济补偿与违约责任

9.1 符合法定情形的，甲方按《劳动合同法》规定向乙方支付经济补偿。
9.2 乙方违反本合同约定或法律法规解除合同，给甲方造成经济损失的，应承担赔偿责任。

第十条  争议解决

10.1 因履行本合同发生的争议，双方应协商解决。
10.2 协商不成的，可向甲方所在地劳动人事争议仲裁委员会申请仲裁。
10.3 对仲裁裁决不服的，可向人民法院提起诉讼。

第十一条  其他

11.1 本合同未尽事宜，按国家法律法规和甲方规章制度执行。
11.2 本合同一式两份，甲乙双方各执一份，具有同等法律效力。
11.3 本合同自甲乙双方签字（盖章）之日起生效。

---

甲方（盖章）：星辰科技有限公司

法定代表人或授权代表（签字）：________________


日期：${today}


---

乙方（签字）：________________


日期：${today}

  `.trim();
};
